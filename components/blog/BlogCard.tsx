import Link from "next/link";
import Image from "next/image";

import type { PostSummary } from "@/lib/blog/content";
import { formatPostDate, postPath } from "@/lib/blog/site";
import { isOptimizableImageSrc } from "@/components/blog/atoms/imageStyles";

/**
 * One post on the home page / blog index. A THANG `.card` (globals.css) with
 * a 16:9 cover on top; styles live under the "--- blog ---" section at the
 * end of globals.css. The whole card is the link.
 */
type Props = {
  post: PostSummary;
  /** Position in the grid — drives the staggered `.reveal` delay. */
  index?: number;
};

export function BlogCard({ post, index = 0 }: Props) {
  const href = postPath(post.slug);
  const dateLabel = formatPostDate(post.date);
  const delay = (index % 4) + 1;

  return (
    <Link
      href={href}
      className={`card post-card reveal d${delay}`}
      aria-label={post.title}
    >
      <div
        className={`post-card__media${post.cover ? "" : " post-card__media--empty"}`}
      >
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.coverAlt || ""}
            fill
            sizes="(max-width: 880px) 100vw, 380px"
            // Manual URLs from hosts outside next.config remotePatterns would
            // throw inside the optimizer — serve those as-is instead.
            unoptimized={!isOptimizableImageSrc(post.cover)}
            className="post-card__img"
          />
        ) : (
          <Image
            src="/ThangLogo.png"
            alt=""
            aria-hidden
            width={72}
            height={72}
            className="post-card__logo"
          />
        )}
      </div>

      <div className="post-card__body">
        {dateLabel && (
          <p className="post-card__date">
            <time dateTime={post.date}>{dateLabel}</time>
          </p>
        )}
        <h3 className="card__title">{post.title}</h3>
        {post.description && <p className="card__text">{post.description}</p>}
        {post.tags.length > 0 && (
          <ul className="post-card__tags" aria-label="Tags">
            {post.tags.map((tag) => (
              <li key={tag} className="tag-chip">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}

export default BlogCard;
