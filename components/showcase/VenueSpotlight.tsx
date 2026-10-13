"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { ShowcaseImage } from "@/data/showcase";
import styles from "./showcase.module.css";

/**
 * The cinema-hall spotlight.
 *
 * Implements the WAI-ARIA tabs pattern properly: roving tabindex so the whole
 * strip is one tab stop, arrow keys to move between spaces, Home/End to jump,
 * `aria-selected` for the active tile and a labelled `tabpanel` holding the
 * image and its caption.
 *
 * The caption and the provenance line are visible text, not tooltips: a visitor
 * should always be able to see that an image is an illustration, and which
 * details are still being confirmed, without interacting at all.
 */
export function VenueSpotlight({
  images,
  label = "Cinema spaces",
}: {
  images: ShowcaseImage[];
  label?: string;
}) {
  const [activeId, setActiveId] = useState(images[0]?.id ?? "");
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  if (images.length === 0) return null;

  const activeIndex = Math.max(
    0,
    images.findIndex((image) => image.id === activeId),
  );
  const active = images[activeIndex];
  const panelId = `${baseId}-panel`;

  function focusIndex(index: number) {
    const next = images[(index + images.length) % images.length];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusIndex(activeIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusIndex(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusIndex(0);
        break;
      case "End":
        event.preventDefault();
        focusIndex(images.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div className={styles.spotlight}>
      <div
        className={styles.stage}
        id={panelId}
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`${baseId}-tab-${active.id}`}
      >
        <Image
          key={active.id}
          src={active.src}
          alt={active.alt}
          fill
          sizes="(min-width: 1000px) 62vw, 100vw"
          // The showcase is the page's main visual, so the first image loads eagerly.
          priority={activeIndex === 0}
        />
        <div className={styles.stageScrim} aria-hidden="true" />
        <div className={styles.stageOverlay}>
          <h3 className={styles.stageTitle}>{active.title}</h3>
          <p className={styles.stageCaption}>{active.caption}</p>
          <p className={styles.stageProvenance}>
            {active.depictsVenue ? "Photograph of this cinema" : active.provenance}
          </p>
        </div>
      </div>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        {images.map((image) => {
          const isActive = image.id === active.id;
          return (
            <button
              key={image.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${image.id}`}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              ref={(element) => {
                tabRefs.current[image.id] = element;
              }}
              onClick={() => setActiveId(image.id)}
              className={styles.tab}
            >
              <span className={styles.tabThumb} aria-hidden="true">
                <Image src={image.src} alt="" fill sizes="32px" />
              </span>
              <span>{image.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
