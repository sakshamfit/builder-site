"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MOTION_MEDIA, type MotionMediaId } from "@/data/media";
import {
  readHeld,
  readPaused,
  readReducedMotion,
  readServerPaused,
  readServerReducedMotion,
  subscribePlayback,
  subscribeReducedMotion,
} from "@/lib/playback";
import styles from "./cinematic.module.css";

/**
 * A moving picture that behaves.
 *
 * Adapted from `components/cinema-media.tsx` in the owner's
 * `gireeshkumarreddy/pk` repository (ASSET_CREDITS.md §11). The layering is
 * upstream's — a still poster first, the muted loop faded in over it only once
 * frames are actually advancing — and so is the discipline: nothing downloads
 * until the frame is near the viewport, and nothing plays while it is off
 * screen, while the tab is hidden, or while the reader has paused the films.
 *
 * Three differences, all deliberate:
 *   1. **No streaming layer.** Upstream escalates from a local loop to an
 *      embedded YouTube player. This site makes no third-party request, and the
 *      only clips it plays are its own renders (data/media.ts), so the player
 *      stops at the local file.
 *   2. **Reduced motion means a still.** For a reader who asks for reduced
 *      motion the video element is never created; the poster is the picture.
 *      Without JavaScript the same poster is in the server-rendered HTML.
 *   3. **A scene can suspend it.** A scroll timeline that has faded this frame
 *      out sets `data-suspended` on it, and the film stops rather than playing
 *      to nobody — an IntersectionObserver cannot see opacity.
 *
 * The poster is art-directed: a portrait cut for portrait screens when the clip
 * has one, chosen by the same media query the video uses, so the still and the
 * film never disagree about the framing.
 */

const PORTRAIT_QUERY = "(max-aspect-ratio: 9/10)";

function subscribePortrait(onChange: () => void) {
  const query = window.matchMedia(PORTRAIT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function CinemaMedia({
  media: id,
  priority = false,
  decorative = true,
  sizes = "100vw",
  className,
}: {
  media: MotionMediaId;
  /** The opening scene: fetch at once rather than when it nears the viewport. */
  priority?: boolean;
  /**
   * True when the surrounding copy already says what the picture is (the
   * default: every placement names it in a caption). False gives the poster
   * the clip's full description as alt text.
   */
  decorative?: boolean;
  /** Layout width hint for the poster's responsive sources. */
  sizes?: string;
  className?: string;
}) {
  const media = MOTION_MEDIA[id];
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  const reduced = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, readServerReducedMotion);
  const paused = useSyncExternalStore(subscribePlayback, readPaused, readServerPaused);
  const held = useSyncExternalStore(subscribePlayback, readHeld, () => false);
  const portrait = useSyncExternalStore(
    subscribePortrait,
    () => Boolean(media.tall) && window.matchMedia(PORTRAIT_QUERY).matches,
    () => false,
  );

  const [near, setNear] = useState(priority);
  const [visible, setVisible] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const source = portrait && media.tall ? media.tall : media.wide;

  /* Near: start fetching a screen ahead. Visible: play only while on screen. */
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const prepare = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          prepare.disconnect();
        }
      },
      { rootMargin: "120% 0px" },
    );
    const view = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setVisible(entry.isIntersecting);
      },
      { threshold: 0.02 },
    );
    prepare.observe(element);
    view.observe(element);
    return () => {
      prepare.disconnect();
      view.disconnect();
    };
  }, []);

  /* A hidden tab plays nothing. */
  useEffect(() => {
    const update = () => setPageHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  /* A scene that has faded this frame out says so on the element itself. */
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const read = () => setSuspended(element.hasAttribute("data-suspended"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(element, { attributes: true, attributeFilter: ["data-suspended"] });
    return () => observer.disconnect();
  }, []);

  const shouldPlay = !reduced && !failed && near && visible && !paused && !held && !pageHidden && !suspended;

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (shouldPlay) {
      /* Muted before play: a browser only lets a silent film start on its own. */
      element.muted = true;
      const attempt = element.play();
      if (attempt) attempt.catch(() => setPlaying(false));
    } else {
      element.pause();
    }
  }, [shouldPlay, source.src, near]);

  /* The still: in the HTML from the server, art-directed, optimised. */
  const alt = decorative ? "" : media.description;
  const wideImage = getImageProps({
    src: media.wide.poster,
    width: media.wide.width,
    height: media.wide.height,
    alt,
    sizes,
    loading: priority ? "eager" : "lazy",
    fetchPriority: priority ? "high" : undefined,
  }).props;
  const tallImage = media.tall
    ? getImageProps({
        src: media.tall.poster,
        width: media.tall.width,
        height: media.tall.height,
        alt,
        sizes,
      }).props
    : null;

  return (
    <div
      ref={root}
      className={[styles.media, className].filter(Boolean).join(" ")}
      data-media={id}
      data-priority={priority ? "true" : undefined}
      data-playing={playing ? "true" : "false"}
    >
      <picture>
        {tallImage ? <source media={PORTRAIT_QUERY} srcSet={tallImage.srcSet} sizes={tallImage.sizes} /> : null}
        {/* A raw <picture> because art direction needs one; getImageProps supplies the optimised sources. */}
        <img {...wideImage} alt={alt} className={styles.mediaPoster} />
      </picture>

      {!reduced && near && !failed ? (
        /* `src` on the element rather than a <source> child: a failed <source>
           fires its error on itself, where the handler below would never hear it. */
        <video
          key={source.src}
          ref={video}
          src={source.src}
          className={styles.mediaVideo}
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          disableRemotePlayback
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onWaiting={() => setPlaying(false)}
          onError={() => {
            setPlaying(false);
            setFailed(true);
          }}
        />
      ) : null}
    </div>
  );
}
