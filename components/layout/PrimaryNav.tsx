"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

export type NavItem = {
  label: string;
  href: string;
  /** Short hint shown in the mobile panel. */
  hint?: string;
};

/**
 * Primary navigation.
 *
 * A client component only because it marks the current section with
 * `aria-current="page"`. Everything else about it is a plain list of links, so
 * it works with JavaScript disabled and in the middle-click/keyboard cases.
 */
export function PrimaryNav({ items, variant }: { items: NavItem[]; variant: "header" | "panel" }) {
  const pathname = usePathname();
  const isHeader = variant === "header";

  return (
    <ul className={isHeader ? styles.nav : styles.panelNav}>
      {items.map((item) => {
        // Hash targets ("/#showtimes") belong to the current page, so they never
        // claim to be a separate current section.
        const [itemPath] = item.href.split("#");
        const isCurrent =
          !item.href.includes("#") &&
          (itemPath === "/" ? pathname === "/" : pathname.startsWith(itemPath));

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={isHeader ? styles.navLink : styles.panelLink}
              aria-current={isCurrent ? "page" : undefined}
            >
              <span>{item.label}</span>
              {!isHeader && item.hint ? (
                <span className={styles.panelLinkHint}>{item.hint}</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
