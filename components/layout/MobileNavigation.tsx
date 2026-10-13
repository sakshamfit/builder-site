"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PrimaryNav, type NavItem } from "@/components/layout/PrimaryNav";
import styles from "./layout.module.css";

/**
 * Mobile menu.
 *
 * Built as a modal panel because it covers the viewport: it traps focus while
 * open, closes on Escape, returns focus to the toggle, and locks background
 * scrolling. The first tab stop on the site is a skip link, so a keyboard user
 * can bypass this entirely.
 *
 * The "tickets" action is a direct link rather than a menu item, so showtime
 * discovery stays one tap away on small screens.
 */
export function MobileNavigation({
  items,
  brandName,
  place,
  ctaHref,
  ctaLabel,
  meta,
}: {
  items: NavItem[];
  brandName: string;
  place: string;
  ctaHref: string;
  ctaLabel: string;
  meta: string[];
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Close on Escape and keep focus inside the panel while it is open. */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* Return focus to the toggle when the panel closes. */
  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={styles.menuToggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
          {open ? (
            <path
              d="M3 3l12 12M15 3L3 15"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M2 4.5h14M2 9h14M2 13.5h14"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          ref={panelRef}
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>{brandName}</span>
            <button
              type="button"
              className={styles.menuToggle}
              onClick={close}
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                <path
                  d="M3 3l12 12M15 3L3 15"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className={styles.panelBody}>
            {/* Any navigation from inside the panel dismisses it, so the
                destination is not hidden behind an overlay. */}
            <div
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) close();
              }}
            >
              <PrimaryNav items={items} variant="panel" />
            </div>

            <div className={styles.panelCta}>
              <Button href={ctaHref} variant="primary" block>
                {ctaLabel}
              </Button>
            </div>

            <div className={styles.panelMeta}>
              <span>{place}</span>
              {meta.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
