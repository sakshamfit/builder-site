"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The choreography for the home page's scenes.
 *
 * Ported from the GSAP timelines in the owner's `gireeshkumarreddy/pk`
 * repository (ASSET_CREDITS.md §11). The timings — the circular exit at 0.35,
 * the ring's −210° turn from 1.3, the velvet flooding at 2.65, the mask lifting
 * off the framed plate at 6.65 — are upstream's, so the sequence moves the way
 * the original does. What changed is how it is attached:
 *
 *   - **Markup first.** Every scene is a server component that reads as a plain
 *     page. This controller enhances it: it sets `data-live` on each scene,
 *     which is what switches the CSS to the pinned stage, and only then builds
 *     the timelines. Without JavaScript, or with reduced motion, it never does.
 *   - **Stable hooks.** Targets are found by `data-j` attributes, never by the
 *     hashed CSS-module class names.
 *   - **Native scroll.** Each timeline is scrubbed by the page's own scroll
 *     position. Nothing listens to the wheel, nothing snaps, and nothing
 *     smooths the scroll — the reader's scrollbar is the only clock.
 *   - **The header follows the stage.** Over a dark scene the chrome takes the
 *     night palette (the same tokens as the night sheet), and gives the reader's
 *     own sheet back when the page beneath it is light again.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function px(name: string, fallback: number): number {
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

/* -------------------------------------------------------------------------- */
/* Header tone                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Puts the chrome in the night palette while a `data-tone="dark"` scene is
 * directly beneath it. Paint only — nothing moves — so it runs for every reader,
 * including those who ask for reduced motion.
 */
function followTone(): () => void {
  const header = document.querySelector<HTMLElement>(".site-header");
  const strip = document.querySelector<HTMLElement>(".utility-strip");
  if (!header) return () => {};

  let frame = 0;
  let current: boolean | null = null;

  const apply = (dark: boolean) => {
    if (dark === current) return;
    current = dark;
    for (const node of [header, strip]) {
      if (!node) continue;
      if (dark) node.setAttribute("data-mode", "night");
      else node.removeAttribute("data-mode");
    }
  };

  const update = () => {
    frame = 0;
    const probe = Math.min(window.innerHeight - 1, header.getBoundingClientRect().bottom + 2);
    let dark = false;
    for (const element of document.elementsFromPoint(window.innerWidth / 2, probe)) {
      /* Fixed furniture (the intro, the playback control) is not the page. */
      if (element.closest(".site-header, .utility-strip, .site-intro, [data-overlay]")) continue;
      dark = element.closest('[data-tone="dark"]') !== null;
      break;
    }
    apply(dark);
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (frame) window.cancelAnimationFrame(frame);
    apply(false);
  };
}

/* -------------------------------------------------------------------------- */
/* Scenes                                                                      */
/* -------------------------------------------------------------------------- */

function hooks(root: HTMLElement) {
  return {
    one: (name: string) => root.querySelector<HTMLElement>(`[data-j="${name}"]`),
    all: (name: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-j="${name}"]`)),
  };
}

function buildJourney(root: HTMLElement, mobile: boolean, headerH: number) {
  const { one, all } = hooks(root);
  const opening = one("opening");
  const shade = one("shade");
  const copy = one("copy");
  const footer = one("footer");
  const credit = one("credit");
  const orbit = one("orbit");
  const tiles = all("tile");
  const mark = one("mark");
  const crescent = one("crescent");
  const field = one("field");
  const manifesto = one("manifesto");
  const statement = one("statement");
  const portrait = one("portrait");
  const outline = one("outline");
  const mask = one("mask");
  const words = one("words");
  const word = all("word");
  const frameImage = one("frameImage");
  if (!opening || !orbit || !field || !manifesto || !statement || !portrait || !mark || !crescent) return;

  const film = opening.querySelector<HTMLElement>("[data-media]");

  gsap.set(tiles, {
    scale: 2.1,
    x: (_: number, element: HTMLElement) => (Number(element.dataset.x) - 50) * 10,
    y: (_: number, element: HTMLElement) => (Number(element.dataset.y) - 50) * 8,
    opacity: 0,
  });
  gsap.set([mark, manifesto, statement, portrait], { autoAlpha: 0 });
  gsap.set([manifesto, statement, mark], { xPercent: -50, yPercent: -50 });
  gsap.set(mark, { scale: 0.82 });
  gsap.set(field, { clipPath: "circle(0% at 50% 50%)" });
  gsap.set(crescent, { autoAlpha: 0, scale: 0.6, rotation: -70 });
  /* Set rather than left to a staggered fromTo: inside a scrubbed timeline only
     the first target of a stagger renders its starting state immediately, and
     the other two words would sit on screen from the start. */
  gsap.set(word, { yPercent: 110, opacity: 0 });

  /* Nine units of timeline across the pinned length of the section. */
  const timeline = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: root,
      start: `top top+=${headerH}`,
      end: "bottom bottom",
      scrub: 0.55,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        /* Once the opening film has shrunk away, stop it rather than play it to nobody. */
        if (film) film.toggleAttribute("data-suspended", self.progress > 2.55 / 9);
      },
    },
  });

  timeline
    .to([copy, footer, credit], { opacity: 0, y: -35, duration: 0.55 }, 0.15)
    .to(opening, { clipPath: "circle(44vmin at 50% 50%)", scale: mobile ? 0.61 : 0.47, duration: 1.5 }, 0.35)
    .to(opening, { scale: 0.1, autoAlpha: 0, rotation: -28, duration: 0.8 }, 1.7)
    .to(shade, { opacity: 0, duration: 0.9 }, 0.7)
    .to(tiles, { scale: 1, x: 0, y: 0, opacity: 1, stagger: 0.025, duration: 1.55 }, 0.55)
    .to(mark, { autoAlpha: 1, scale: 1, duration: 0.7 }, 1.9)
    .to(orbit, { rotation: -210, rotationX: 10, duration: 2.3, ease: "none" }, 1.3)
    .to(
      tiles,
      {
        rotationY: (index: number) => (index % 2 === 0 ? 22 : -22),
        rotationZ: (index: number) => (index % 2 === 0 ? 14 : -14),
        duration: 2.3,
        ease: "none",
      },
      1.3,
    )
    .to(crescent, { autoAlpha: 1, scale: 1, duration: 0.5 }, 1.8)
    .to(crescent, { rotation: 360, scale: 1.6, duration: 1.8, ease: "power2.inOut" }, 2.0)
    .to(crescent, { autoAlpha: 0, duration: 0.5 }, 3.1)
    .to(field, { clipPath: "circle(150% at 50% 50%)", duration: 1.0 }, 2.65)
    .to(mark, { opacity: 0.1, scale: 1.2, duration: 0.5 }, 2.7)
    .fromTo(manifesto, { y: 35 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 2.75)
    .to(tiles, { scale: 0.65, duration: 1.2, stagger: 0.015 }, 2.6)
    .to(
      tiles,
      {
        y: (_: number, element: HTMLElement) => (Number(element.dataset.y) > 50 ? 1 : -1) * window.innerHeight * 0.8,
        opacity: 0,
        duration: 1.05,
        stagger: 0.025,
      },
      3.65,
    )
    .to(manifesto, { autoAlpha: 0, y: -20, duration: 0.5 }, 4.0)
    .to(statement, { autoAlpha: 1, duration: 0.5 }, 4.25)
    .to([statement, mark], { autoAlpha: 0, duration: 0.5 }, 4.85)
    .to(field, { clipPath: "circle(0% at 50% 25%)", duration: 1 }, 5.1)
    .fromTo(portrait, { y: "55vh" }, { y: 0, autoAlpha: 1, duration: 1 }, 5.1)
    .fromTo(outline, { y: -70 }, { y: -24, duration: 1 }, 5.8)
    .to(mask, { yPercent: -101, duration: 0.85 }, 6.65)
    .to(word, { yPercent: 0, opacity: 1, stagger: 0.22, duration: 0.65 }, 7.0)
    .to(frameImage, { scale: 1.06, duration: 1.4 }, 7.4)
    .to(words, { y: -20, duration: 0.8 }, 8.0)
    .to({}, { duration: 0.35 }, 8.65);
}

function buildWide(root: HTMLElement) {
  const { one } = hooks(root);
  const media = one("wideMedia");
  const copy = one("wideCopy");
  if (!media || !copy) return;
  gsap.fromTo(
    media,
    { clipPath: "inset(35% 0% 0% 0%)", scale: 0.94 },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      scale: 1,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top bottom", end: "top top", scrub: 0.5 },
    },
  );
  gsap.fromTo(
    copy,
    { y: 60, opacity: 0 },
    { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: root, start: "top 45%", end: "top 10%", scrub: 0.5 } },
  );
  gsap.fromTo(
    media,
    { yPercent: 0 },
    { yPercent: 7, ease: "none", scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } },
  );
}

function buildWorld(root: HTMLElement, mobile: boolean, headerH: number) {
  const { one, all } = hooks(root);
  const copy = one("worldCopy");
  const caption = one("worldCaption");
  const stars = all("star");
  if (!copy || stars.length === 0) return;

  gsap.set(stars, {
    left: (_: number, element: HTMLElement) => `${Number(mobile ? element.dataset.mLeft : element.dataset.left) || 50}%`,
    top: (_: number, element: HTMLElement) => `${Number(mobile ? element.dataset.mTop : element.dataset.top) || 50}%`,
    rotation: (_: number, element: HTMLElement) => Number(element.dataset.r) || 0,
    rotationY: (_: number, element: HTMLElement) => Number(element.dataset.ry) || 0,
  });
  gsap.set(caption, { autoAlpha: 0, xPercent: -50 });

  const spacing = mobile ? 18.5 : 15;
  const width = mobile ? 17 : 12.5;
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: root, start: `top top+=${headerH}`, end: "bottom bottom", scrub: 0.65 },
  });
  timeline
    .to(copy, { opacity: 0, y: -70, duration: 0.5 }, 0.5)
    .to(
      stars,
      {
        left: (index: number) => `${50 + (index - (stars.length - 1) / 2) * spacing}%`,
        top: "44%",
        width: `${width}%`,
        xPercent: -50,
        yPercent: -50,
        rotation: 0,
        rotationY: 0,
        duration: 1.5,
        stagger: 0.08,
        ease: "power2.inOut",
      },
      0.15,
    )
    .to(caption, { autoAlpha: 1, duration: 0.4 }, 1.25)
    .to(stars, { y: 90, opacity: 0, duration: 0.65, stagger: 0.05 }, 1.9)
    .to(caption, { autoAlpha: 0, duration: 0.4 }, 2.1);
}

function buildFilms(root: HTMLElement) {
  for (const chapter of Array.from(root.querySelectorAll<HTMLElement>('[data-j="chapter"]'))) {
    const banner = chapter.querySelector<HTMLElement>('[data-j="banner"]');
    const title = chapter.querySelector<HTMLElement>('[data-j="chapterTitle"]');
    if (banner) {
      gsap.fromTo(
        banner,
        { scale: 0.88, y: 50 },
        { scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: chapter, start: "top 90%", end: "top 25%", scrub: 0.6 } },
      );
    }
    if (title) {
      gsap.fromTo(
        title,
        { y: 65 },
        { y: -30, ease: "none", scrollTrigger: { trigger: chapter, start: "top bottom", end: "bottom top", scrub: 0.6 } },
      );
    }
  }
}

function buildEnd(root: HTMLElement) {
  const { one } = hooks(root);
  const card = one("endCard");
  const mark = one("endMark");
  if (card) {
    gsap.fromTo(
      card,
      { clipPath: "inset(18% 8% 18% 8%)", y: 75 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        y: 0,
        ease: "none",
        scrollTrigger: { trigger: card, start: "top 95%", end: "top 35%", scrub: 0.6 },
      },
    );
  }
  if (mark) {
    gsap.fromTo(
      mark,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 65%" } },
    );
  }
}

/* -------------------------------------------------------------------------- */

export function CinematicMotion() {
  useLayoutEffect(() => {
    const stopTone = followTone();
    if (window.matchMedia(REDUCED_MOTION).matches) return stopTone;

    gsap.registerPlugin(ScrollTrigger);
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    for (const scene of scenes) scene.setAttribute("data-live", "");

    const mobile = window.innerWidth < 700;
    const headerH = px("--header-h", 62);
    const scene = (name: string) => document.querySelector<HTMLElement>(`[data-scene="${name}"]`);

    const context = gsap.context(() => {
      const journey = scene("journey");
      if (journey) buildJourney(journey, mobile, headerH);
      const wide = scene("wide");
      if (wide) buildWide(wide);
      const world = scene("world");
      if (world) buildWorld(world, mobile, headerH);
      const films = scene("films");
      if (films) buildFilms(films);
      const end = scene("end");
      if (end) buildEnd(end);

      const progress = document.querySelector<HTMLElement>('[data-j="progress"]');
      if (progress) {
        gsap.to(progress, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: true },
        });
      }
    });

    /* Late layout — images, fonts — moves every trigger; measure again. */
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      window.removeEventListener("load", refresh);
      context.revert();
      for (const element of scenes) element.removeAttribute("data-live");
      stopTone();
    };
  }, []);

  return null;
}
