import Image from "next/image";
import styles from "./ui.module.css";

/**
 * Poster artwork.
 *
 * `alt` is required. A movie poster carries the film's title visually, so the
 * default guidance is to describe it as "<Title> poster" — meaningful to a
 * screen-reader user, not a decorative duplicate of the adjacent heading.
 */
export function PosterImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  /** Widths hint for the responsive loader. Always set this. */
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={[styles.poster, className].filter(Boolean).join(" ")}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        // Posters are the largest paint on the page; eager-load the first row
        // only, and let the rest arrive as they scroll into view.
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}
