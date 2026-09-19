"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoProps } from "@/lib/blog/schema";
import { cn } from "@/lib/blog/utils";
import { youtubeEmbedUrl } from "@/lib/blog/youtube";
import { useEdit } from "@/components/blog/EditContext";

/** "16/9" → 16/9 as a number. Tolerates spaces and bare numbers. */
function parseAspectRatio(aspect: string): number {
  const [w, h = "1"] = (aspect || "16/9").split("/");
  const num = parseFloat(w);
  const den = parseFloat(h);
  return num > 0 && den > 0 ? num / den : 16 / 9;
}

/**
 * Video atom. Two sources share the block: `source: "file"` renders an
 * uploaded video (`/uploads/blog/videos/…`) in a native `<video>`; `source:
 * "youtube"` (default) embeds the YouTube player described below. Both sit
 * inside the same aspect-locked frame, so `aspect` / `fit` / `radius`
 * behave identically.
 *
 * YouTube: in the editor the iframe stays inert so clicks
 * select the block (and mount the resize grips) instead of feeding the
 * player. On the public site the iframe is *also* inert until clicked:
 * wheel events over a cross-origin iframe are swallowed by the embed, so
 * an always-interactive player blocks page scroll whenever the cursor
 * crosses it. A click engages the player (and asks it to play via the
 * IFrame API so the first click isn't dead); moving the pointer off the
 * block disengages it so scrolling works again.
 *
 * Sizing: `fit: "width"` fills the block's width and derives height from
 * `aspect`. `fit: "height"` sizes the frame from the block's *height* —
 * width is computed from the measured cell height via container-query
 * units, and if that width doesn't fit the whole frame scales down
 * (contain semantics). Either way the frame is always exactly `aspect`,
 * so the YouTube player never letterboxes inside it. `fit: "height"`
 * requires a definite block height, which the grid layout provides.
 */
export function Video(props: VideoProps) {
  const {
    url,
    source,
    src,
    poster,
    autoplay,
    muted,
    loop,
    controls,
    start,
    aspect,
    fit,
    radius,
  } = props;
  const editing = useEdit() !== null;
  const isFile = source === "file";
  const embed = youtubeEmbedUrl(url, {
    autoplay,
    muted,
    loop,
    controls,
    start,
    enableJsApi: !editing,
  });
  const hasMedia = isFile ? !!src : !!embed;
  const ratio = parseAspectRatio(aspect);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [engaged, setEngaged] = useState(false);

  // File source: React sets `muted` as a DOM property (not an attribute),
  // so it's missing from the SSR markup and a fast-loading file can hit the
  // browser's autoplay check before hydration. Re-assert it and kick
  // play(); toggling autoplay off in the editor pauses the preview.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !isFile) return;
    if (autoplay) {
      el.muted = true;
      el.play()?.catch(() => {});
    } else if (editing) {
      el.pause();
    }
  }, [isFile, autoplay, src, editing]);

  function engage() {
    setEngaged(true);
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "playVideo", args: [] }),
      "*"
    );
  }

  const frame = (
    <div
      className={cn(
        "relative overflow-hidden",
        fit === "height" ? "max-h-full max-w-full" : "w-full",
        radius === 0 && "rounded-sm",
        !hasMedia && "bg-surface border border-border"
      )}
      style={{
        aspectRatio: aspect || "16/9",
        borderRadius: radius ? `${radius}px` : undefined,
        // Fill the cell's height; cap at its width. The frame keeps its
        // aspect ratio, so when width binds the whole frame shrinks.
        width: fit === "height" ? `min(100cqw, calc(100cqh * ${ratio}))` : undefined,
      }}
      onPointerLeave={editing ? undefined : () => setEngaged(false)}
    >
      {isFile ? (
        src ? (
          // Native player. In the editor it's inert (like the iframe) so
          // clicks select the block; on the public site the browser's own
          // controls handle interaction and wheel scrolling passes through.
          <video
            ref={videoRef}
            src={src}
            poster={poster || undefined}
            controls={controls}
            autoPlay={autoplay}
            muted={muted || autoplay}
            loop={loop}
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => {
              if (start && start > 0) e.currentTarget.currentTime = start;
            }}
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              editing && "pointer-events-none"
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-foreground/30 italic kicker text-center px-4">
            Upload a video
          </div>
        )
      ) : embed ? (
        <>
          <iframe
            ref={iframeRef}
            src={embed}
            title="YouTube video"
            className={cn(
              "absolute inset-0 h-full w-full",
              !editing && engaged ? "pointer-events-auto" : "pointer-events-none"
            )}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
          {!editing && !engaged && (
            <div
              className="absolute inset-0 cursor-pointer"
              role="button"
              aria-label="Play video"
              onClick={engage}
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-foreground/30 italic kicker text-center px-4">
          Paste a YouTube URL
        </div>
      )}
    </div>
  );

  if (fit !== "height") return frame;

  // The measuring container: cqw/cqh in the frame's width resolve against
  // this element's rendered size, i.e. the block cell.
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ containerType: "size" }}
    >
      {frame}
    </div>
  );
}
