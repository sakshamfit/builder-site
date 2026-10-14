"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { MOTION } from "@/lib/motion";
import {
  APPEARANCE_ATTRIBUTE,
  APPEARANCE_COLORS,
  APPEARANCE_STORAGE_KEY,
  APPEARANCE_TRANSITION_ATTRIBUTE,
  resolveMode,
  type Mode,
} from "@/lib/appearance";

/**
 * Appearance provider — day and night.
 *
 * Adapted from `ModeProvider` in the owner's `vistaRail` repository (see
 * ASSET_CREDITS.md §10), with three changes this project needs:
 *
 *   1. **The document is the source of truth, not React state.** The pre-paint
 *      script in `app/layout.tsx` has already set the attribute by the time this
 *      mounts, so the provider *reads* it through `useSyncExternalStore` rather
 *      than holding a parallel copy that could disagree with the page the
 *      visitor is already looking at. It is the same pattern `SiteIntro` uses for
 *      reduced motion, and it keeps the server and client renders in step: the
 *      server snapshot is always "day", then the real value arrives.
 *   2. **No `busy` lock.** The upstream lock exists because its toggle crossfades
 *      two videos, which must not overlap. Here the change is paint only, so a
 *      reader who taps again mid-fade simply gets the other sheet — there is
 *      nothing to protect, and a disabled button would be a lie.
 *   3. **The OS is followed until the reader chooses.** An explicit choice is
 *      stored and wins from then on; a stored value is never overwritten by a
 *      system change.
 */

type ModeContextValue = {
  mode: Mode;
  /** Switches sheets and remembers the choice. */
  toggle: () => void;
};

const ModeContext = createContext<ModeContextValue | null>(null);

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * What the page is actually showing. Read from the document rather than from
 * React, so this can never disagree with the stylesheet's own selector.
 */
function readMode(): Mode {
  if (typeof document === "undefined") return "day";
  const value = document.documentElement.getAttribute(APPEARANCE_ATTRIBUTE);
  return value === "night" ? "night" : "day";
}

/** Before hydration there is no attribute of our own; the server renders day. */
function readServerMode(): Mode {
  return "day";
}

let timer: ReturnType<typeof setTimeout> | null = null;

/** Paint the mode, and say so. */
function applyMode(mode: Mode) {
  const root = document.documentElement;
  const previous = root.getAttribute(APPEARANCE_ATTRIBUTE);

  root.setAttribute(APPEARANCE_ATTRIBUTE, mode);

  /* Let surfaces crossfade, but only while the change is happening. Nothing in
     the site carries a permanent transition on its paint properties. */
  if (previous !== null && previous !== mode) {
    root.setAttribute(APPEARANCE_TRANSITION_ATTRIBUTE, "on");
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      root.removeAttribute(APPEARANCE_TRANSITION_ATTRIBUTE);
      timer = null;
    }, MOTION.duration.theme);
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", APPEARANCE_COLORS[mode]);

  for (const listener of listeners) listener();
}

function readStoredMode(): string | null {
  try {
    return window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribe, readMode, readServerMode);

  /** True once the reader has chosen a sheet by hand. */
  const chosen = useRef(false);

  useEffect(() => {
    chosen.current = readStoredMode() !== null;

    /*
     * Bring the browser chrome in line with whatever the pre-paint script
     * decided. This is a no-op on the attribute (it is already set, and applying
     * the same value opens no crossfade) and it is the only thing that keeps a
     * night visitor's address bar from staying cream.
     */
    applyMode(readMode());

    /* Follow the operating system while the reader has not chosen. */
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = (event: MediaQueryListEvent) => {
      if (chosen.current) return;
      applyMode(resolveMode(readStoredMode(), event.matches));
    };
    query.addEventListener("change", onSystemChange);

    /* And follow a choice made in another tab of this site. */
    const onStorage = (event: StorageEvent) => {
      if (event.key !== APPEARANCE_STORAGE_KEY) return;
      const next = resolveMode(event.newValue, query.matches);
      chosen.current = true;
      applyMode(next);
    };
    window.addEventListener("storage", onStorage);

    return () => {
      query.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggle = useCallback(() => {
    const next: Mode = readMode() === "night" ? "day" : "night";
    chosen.current = true;
    try {
      window.localStorage.setItem(APPEARANCE_STORAGE_KEY, next);
    } catch {
      /* Storage unavailable: the choice still applies for this page view. */
    }
    applyMode(next);
  }, []);

  const value = useMemo<ModeContextValue>(() => ({ mode, toggle }), [mode, toggle]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode(): ModeContextValue {
  const context = useContext(ModeContext);
  if (!context) throw new Error("useMode must be used within a ModeProvider");
  return context;
}
