"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { MOTION_MEDIA, MOTION_MEDIA_CREDIT } from "@/data/media";
import { holdFilms, readReducedMotion, readServerReducedMotion, subscribeReducedMotion } from "@/lib/playback";
import styles from "./cinematic.module.css";

/**
 * "Watch the reel" — the title sequence, full size, with controls.
 *
 * Adapted from the film dialog in the owner's `gireeshkumarreddy/pk`
 * repository (ASSET_CREDITS.md §11). Upstream opens a YouTube player for a
 * film's trailer; this opens the site's own render, from its own server, and
 * says in words what the reader is about to watch — and what it is not.
 *
 * It is a native <dialog> opened with `showModal()`, which gives focus
 * containment, Escape to close and return of focus to the button for free.
 * It is portalled to <body> so that the scroll timeline fading the opening
 * scene out can never fade the dialog out with it. While it is open the
 * background films are held, so only one picture moves at a time.
 */

const PORTRAIT_QUERY = "(max-aspect-ratio: 9/10)";

/* True on the client, false while rendering on the server: the portal needs a body. */
const subscribeNothing = () => () => {};

export function ReelButton({ className }: { className?: string }) {
  const reel = MOTION_MEDIA.reel;
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const release = useRef<(() => void) | null>(null);
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [portrait, setPortrait] = useState(false);
  const reduced = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, readServerReducedMotion);

  /* A dialog unmounted while open must still let the background films go. */
  useEffect(() => () => release.current?.(), []);

  function open() {
    const element = dialog.current;
    if (!element) return;
    setPortrait(Boolean(reel.tall) && window.matchMedia(PORTRAIT_QUERY).matches);
    element.showModal();
    release.current = holdFilms();
    /* The reader asked for this, so it may start — unless they asked for reduced
       motion, in which case the controls are there and the choice is theirs. */
    if (!reduced) {
      window.requestAnimationFrame(() => {
        video.current?.play().catch(() => {});
      });
    }
  }

  function onClose() {
    video.current?.pause();
    release.current?.();
    release.current = null;
  }

  const source = portrait && reel.tall ? reel.tall : reel.wide;

  return (
    <>
      <button type="button" className={className} onClick={open}>
        <span className={styles.playIcon} aria-hidden="true" />
        Watch the reel
      </button>

      {mounted
        ? createPortal(
            <dialog
              ref={dialog}
              className={styles.dialog}
              data-mode="night"
              aria-labelledby="reel-title"
              aria-describedby="reel-description"
              onClose={onClose}
              onClick={(event) => {
                /* A click on the backdrop lands on the dialog itself. */
                if (event.target === dialog.current) dialog.current?.close();
              }}
            >
              <div className={styles.dialogHead}>
                <div>
                  <span className="eyebrow">Original motion · {reel.durationSeconds} seconds · no sound</span>
                  <h2 id="reel-title" className={styles.dialogTitle}>
                    The reel
                  </h2>
                </div>
                <button
                  type="button"
                  className={styles.dialogClose}
                  onClick={() => dialog.current?.close()}
                  aria-label="Close the reel"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <video
                key={source.src}
                ref={video}
                className={styles.dialogVideo}
                data-portrait={portrait ? "true" : undefined}
                src={source.src}
                poster={source.poster}
                width={source.width}
                height={source.height}
                controls
                loop
                muted
                playsInline
                preload="none"
              />

              <p id="reel-description" className={styles.dialogText}>
                {reel.description}
              </p>
              <p className={styles.dialogCredit}>{MOTION_MEDIA_CREDIT}</p>
            </dialog>,
            document.body,
          )
        : null}
    </>
  );
}
