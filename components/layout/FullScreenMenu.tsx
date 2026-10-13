"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/lib/nav";
import styles from "./layout.module.css";

/**
 * Full-screen menu.
 *
 * Slides down over the page in the accent colour — a poster flipped to its
 * reverse. Built as a modal because it covers the viewport: focus moves in and
 * is trapped, Escape closes it, focus returns to the toggle, and background
 * scrolling is locked.
 *
 * The links are indexed like a contents page, which is also what makes the
 * numbering useful rather than decorative.
 */
export function FullScreenMenu({ items, brandName }: { items: NavItem[]; brandName: string }) {
  /*
   * The panel's open state is recorded against the route it was opened on, so a
   * navigation closes it during the same render — no effect, no flash of the
   * previous page's menu over the new page.
   */
  const [openAtPath, setOpenAtPath] = useState<string | null>(null);
  const pathname = usePathname();
  const open = openAtPath === pathname;
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
        setOpenAtPath(null);
        toggleRef.current?.focus();
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

  function close() {
    setOpenAtPath(null);
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
        onClick={() => (open ? close() : setOpenAtPath(pathname))}
      >
        <span className={styles.menuToggleLines} aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      {open ? (
        <div id={panelId} ref={panelRef} className={styles.menu} role="dialog" aria-modal="true" aria-label="Site menu">
          <div className={styles.menuTop}>
            <span className={styles.menuBrand}>{brandName}</span>
            <button type="button" className={styles.menuClose} onClick={close} aria-label="Close menu">
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <nav className={styles.menuNav} aria-label="Site sections">
            {items.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.menuLink}
                aria-current={
                  !item.href.includes("#") &&
                  (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                    ? "page"
                    : undefined
                }
                onClick={close}
              >
                <span>{item.label}</span>
                <sup aria-hidden="true">{String(index + 1).padStart(2, "0")}</sup>
              </Link>
            ))}
          </nav>

          <p className={styles.menuFoot}>
            A showcase of the cinema hall at Madhuban, Bihar. Ticket links appear once the
            venue&rsquo;s ticketing partner is confirmed.
          </p>
        </div>
      ) : null}
    </>
  );
}
