import Image from "next/image";
import type { ShowcaseImage } from "@/data/showcase";
import styles from "./showcase.module.css";

/**
 * The full set of space images as a responsive grid.
 *
 * Used on the venue page, where a visitor is actively deciding whether to come:
 * larger captions, a visible provenance line per tile, and no interaction
 * required to read any of it.
 */
export function VenueGallery({
  images,
  note,
}: {
  images: ShowcaseImage[];
  note?: string;
}) {
  if (images.length === 0) return null;

  return (
    <>
      <ul className={styles.gallery}>
        {images.map((image) => (
          <li className={styles.galleryItem} key={image.id}>
            <div className={styles.galleryFrame}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1000px) 33vw, 46vw"
              />
            </div>
            <h3 className={styles.galleryTitle}>{image.title}</h3>
            <p className={styles.galleryCaption}>{image.caption}</p>
            <p className={styles.galleryProvenance}>
              {image.depictsVenue ? "Photograph of this cinema" : image.provenance}
            </p>
          </li>
        ))}
      </ul>
      {note ? <p className={styles.galleryNote}>{note}</p> : null}
    </>
  );
}
