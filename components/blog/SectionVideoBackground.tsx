"use client";

import { useEffect, useRef } from "react";
import type { Section } from "@/lib/blog/schema";
import { youtubeEmbedUrl } from "@/lib/blog/youtube";
import { imageTintBgClass } from "@/components/blog/atoms/imageStyles";
import { cn } from "@/lib/blog/utils";

// YouTube's IFrame API only honors a fixed set of playback rates; other
// values either do nothing or get rounded silently. Snap to the closest
// allowed value so a stale slider position can't make the video lock up.
const ALLOWED_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
function snapRate(rate: number): number {
  return ALLOWED_RATES.reduce((best, r) =>
    Math.abs(r - rate) < Math.abs(best - rate) ? r : best
  , 1 as number);
}

/** Uploaded-file background (as opposed to the YouTube iframe path). */
function isFileVideoBackground(bg: Section["background"]): boolean {
  return bg.type === "video" && bg.source === "file" && !!bg.src;
}

/**
 * Section video background. Two sources share the block:
 *
 *  - `source: "file"` — an uploaded video (`/uploads/blog/videos/…`) rendered
 *    as a native, muted, looping `<video>`; playback rate is set directly
 *    on the element once metadata is in.
 *  - `source: "youtube"` (default) — the YouTube iframe described below.
 *
 * Both pause while the section is scrolled offscreen or the tab is hidden.
 *
 * YouTube background with object-cover-style scaling. The inner div is
 * sized to *at least* fill the container in both axes while keeping its
 * 16:9 aspect — whichever min wins decides the final size, the other axis
 * grows past the container, and `overflow-hidden` on the section crops it.
 *
 * Playback rate is applied via the YouTube IFrame postMessage protocol —
 * URL params can't set rate, so we wait for the player's `onReady` event
 * and then send `setPlaybackRate`.
 */
export function SectionVideoBackground({
  bg,
}: {
  bg: Section["background"];
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isFile = isFileVideoBackground(bg);

  useEffect(() => {
    if (bg.type !== "video" || isFile) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const rate = snapRate(bg.playbackRate);

    function send(payload: object) {
      iframe?.contentWindow?.postMessage(JSON.stringify(payload), "*");
    }

    // Subscribe so the iframe will emit `onReady` / `infoDelivery` events.
    function subscribe() {
      send({ event: "listening" });
    }
    function applyRate() {
      send({ event: "command", func: "setPlaybackRate", args: [rate] });
    }

    function onMessage(e: MessageEvent) {
      if (e.source !== iframe?.contentWindow) return;
      // YouTube messages are JSON strings; ignore anything else (extensions
      // sometimes shout into the same channel).
      let data: { event?: string; info?: { playerState?: number } } | null = null;
      if (typeof e.data === "string") {
        try {
          data = JSON.parse(e.data);
        } catch {
          return;
        }
      } else if (typeof e.data === "object") {
        data = e.data as typeof data;
      }
      if (!data) return;
      // Re-apply on every "playing" tick — YouTube resets the rate when
      // looping a muted background, so a one-shot setter drifts back to 1×.
      if (data.event === "onReady") applyRate();
      if (data.event === "infoDelivery") applyRate();
    }

    window.addEventListener("message", onMessage);
    iframe.addEventListener("load", subscribe);
    // The player can be ready before our load handler attaches when it's
    // served from the YT cache; nudge it.
    subscribe();
    const t = setTimeout(applyRate, 800);

    // Pause the stream while the section is scrolled out of view or the tab
    // is hidden — a looping background otherwise keeps fetching and decoding
    // video for pixels nobody sees. Resume on re-entry (it's a muted
    // autoplay background; there's no user-initiated pause to respect).
    let inView = true;
    function syncPlayback() {
      if (inView && !document.hidden) {
        send({ event: "command", func: "playVideo", args: [] });
      } else {
        send({ event: "command", func: "pauseVideo", args: [] });
      }
    }
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]) {
            inView = entries[0].isIntersecting;
            syncPlayback();
          }
        },
        { threshold: 0.01 }
      );
      io.observe(iframe);
    }
    function onVisibility() {
      syncPlayback();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("message", onMessage);
      iframe.removeEventListener("load", subscribe);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
      clearTimeout(t);
    };
    // bg.playbackRate is the only knob users tweak after mount; the rest
    // come bundled in the URL/embed and a remount happens via the parent.
  }, [bg, isFile]);

  // Native <video> branch (uploaded file). Same lifecycle as the iframe:
  // apply the playback rate (and start offset) once metadata is in, and
  // pause while the section is offscreen or the tab is hidden.
  useEffect(() => {
    if (bg.type !== "video" || !isFile) return;
    const video = videoRef.current;
    if (!video) return;

    const rate = Number.isFinite(bg.playbackRate) ? bg.playbackRate : 1;
    const start = bg.start && bg.start > 0 ? bg.start : 0;
    function applyRate() {
      if (!video) return;
      video.playbackRate = rate;
      if (start > 0 && video.currentTime < start) video.currentTime = start;
    }
    // React sets `muted` as a DOM property, not an attribute, so it's absent
    // from the SSR markup — assert it before the first play() so autoplay
    // policies never block the (silent) background.
    video.muted = true;
    video.addEventListener("loadedmetadata", applyRate);
    if (video.readyState >= 1) applyRate();

    let inView = true;
    function syncPlayback() {
      if (!video) return;
      if (inView && !document.hidden) {
        video.play()?.catch(() => {});
      } else {
        video.pause();
      }
    }
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]) {
            inView = entries[0].isIntersecting;
            syncPlayback();
          }
        },
        { threshold: 0.01 }
      );
      io.observe(video);
    }
    function onVisibility() {
      syncPlayback();
    }
    document.addEventListener("visibilitychange", onVisibility);
    syncPlayback();

    return () => {
      video.removeEventListener("loadedmetadata", applyRate);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [bg, isFile]);

  if (bg.type !== "video") return null;
  const tintClass = imageTintBgClass[bg.tint];
  const showTint = tintClass !== null && bg.tintOpacity > 0;
  // Legibility overlay + color tint, shared by both sources.
  const overlays = (
    <>
      {bg.overlay > 0 && (
        <div
          aria-hidden
          className="absolute inset-0 bg-background pointer-events-none"
          style={{ opacity: bg.overlay / 100 }}
        />
      )}
      {showTint && (
        <div
          aria-hidden
          className={cn("absolute inset-0 pointer-events-none", tintClass)}
          style={{ opacity: bg.tintOpacity / 100 }}
        />
      )}
    </>
  );

  if (isFile) {
    return (
      <>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video
            ref={videoRef}
            src={bg.src}
            autoPlay
            muted
            loop={bg.loop}
            playsInline
            preload="metadata"
            aria-hidden
            tabIndex={-1}
            className="absolute inset-0 min-w-full min-h-full h-full w-full object-cover pointer-events-none"
          />
        </div>
        {overlays}
      </>
    );
  }

  const embed = youtubeEmbedUrl(bg.url, {
    autoplay: true,
    muted: bg.muted,
    loop: bg.loop,
    controls: false,
    start: bg.start,
    enableJsApi: true,
    // `origin` is intentionally omitted: it can only be read on the client
    // (`window.location.origin`), so folding it into the URL during render
    // makes the iframe `src` diverge between SSR and hydration — a hydration
    // mismatch. The IFrame API still accepts our postMessage commands without
    // it (we post to targetOrigin "*"), so playback-rate control is unaffected.
  });
  if (!embed) return null;
  return (
    <>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full"
          style={{ aspectRatio: "16 / 9" }}
        >
          <iframe
            ref={iframeRef}
            src={embed}
            title="Section background video"
            className="absolute inset-0 h-full w-full pointer-events-none"
            allow="autoplay; encrypted-media; picture-in-picture"
            // Below-fold background embeds defer until scrolled near;
            // in-viewport ones (the hero) load immediately regardless.
            loading="lazy"
            tabIndex={-1}
            aria-hidden
          />
        </div>
      </div>
      {overlays}
    </>
  );
}
