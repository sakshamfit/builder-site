/**
 * MOTION MEDIA — the only video this site plays, and it is ours.
 *
 * Every clip listed here was rendered for this project by
 * `scripts/render-reel.mts`, frame by frame, from the original cover plates in
 * `public/cover-art/` (see `data/cover-art.json`) and from shapes drawn in that
 * script: a projector beam, dust in the light, a velvet curtain, a turning reel.
 * There is no camera footage in them, no film footage, no trailer, no still from
 * any film, no actor, no logo and no lettering — so nothing here can be mistaken
 * for a studio's material, and nothing here claims to show this building.
 *
 * WHY THIS EXISTS INSTEAD OF BORROWED FOOTAGE: the motion system on the home page
 * was adapted from the owner's `gireeshkumarreddy/pk` repository (ASSET_CREDITS.md
 * §11). That repository's own media — stills and clips from a released feature
 * film, the film's title artwork, and an actor's likeness — belongs to the film's
 * producers and music label, not to the repository, and its README says so. The
 * code travelled; the media did not. These renders fill the same slots.
 *
 * HOW REAL FOOTAGE GETS HERE LATER: the venue supplies its own walkthrough film
 * with a written licence, or a distributor supplies a trailer in writing for a
 * title this cinema is actually screening. Either is added as a new entry with
 * `provenance` describing that licence — never as a file dropped in unannounced.
 * `npm run check` fails if a file in `public/media/` is not declared here, if a
 * declared file is missing, if a clip outgrows its budget, if its dimensions or
 * running time disagree with this record, or if any of the source repository's
 * own media files ever appears anywhere under `public/`.
 */

export type MediaSource = {
  /** Path under /public, served as-is. */
  src: string;
  /** Still frame shown before playback, under reduced motion, and without JavaScript. */
  poster: string;
  width: number;
  height: number;
};

export type MotionMedia = {
  id: MotionMediaId;
  /**
   * What the clip shows, in words. This is the poster's alt text and the reel
   * dialog's description, so it has to be true of every frame — including the
   * statement of what the clip is not.
   */
  description: string;
  /** The landscape master. */
  wide: MediaSource;
  /** A portrait cut for phones, when the composition needs one rather than a crop. */
  tall?: MediaSource;
  durationSeconds: number;
  fps: number;
  /** True when the last frame meets the first, so the loop has no visible seam. */
  seamless: boolean;
  provenance: "original-render";
  /** Cover plates (slugs in data/cover-art.json) the clip is composed from. */
  derivedFrom: string[];
  renderer: "scripts/render-reel.mts";
};

export type MotionMediaId = "reel" | "gallery" | "rings";

/** The words every surface showing one of these clips is allowed to use about it. */
export const MOTION_MEDIA_CREDIT =
  "Original motion made for this site from its own cover art — not footage of this cinema, and not from any film.";

export const MOTION_MEDIA: Record<MotionMediaId, MotionMedia> = {
  reel: {
    id: "reel",
    description:
      "An original title sequence made for this site: a projector beam lights an abstract cover plate, a row of plates passes under spotlights, a reel of gold and crimson rings turns, and a velvet curtain closes. Rendered from the site's own cover art. It is not footage of this cinema and contains nothing from any film.",
    wide: {
      src: "/media/reel-wide.mp4",
      poster: "/media/reel-wide.jpg",
      width: 1920,
      height: 1080,
    },
    tall: {
      src: "/media/reel-tall.mp4",
      poster: "/media/reel-tall.jpg",
      width: 1080,
      height: 1920,
    },
    durationSeconds: 20,
    fps: 30,
    seamless: true,
    provenance: "original-render",
    derivedFrom: [
      "coco-2",
      "tu-hai-meri-kiran",
      "jailer-2",
      "cult",
      "frozen-iii",
      "klara-and-the-sun",
      "doraemon-castle-of-the-undersea-devil",
      "street-fighter",
      "wildwood",
      "ramayana-part-one",
    ],
    renderer: "scripts/render-reel.mts",
  },
  gallery: {
    id: "gallery",
    description:
      "Abstract cover plates made for this site drift past under warm spotlights above a polished floor. Original motion, not footage of this cinema and not from any film.",
    wide: {
      src: "/media/gallery.mp4",
      poster: "/media/gallery.jpg",
      width: 1920,
      height: 1080,
    },
    durationSeconds: 15,
    fps: 30,
    seamless: true,
    provenance: "original-render",
    derivedFrom: ["godzilla-minus-zero", "prem-keetanu", "udta-teer", "the-cat-in-the-hat", "nayyi-navelli"],
    renderer: "scripts/render-reel.mts",
  },
  rings: {
    id: "rings",
    description:
      "Concentric rings of gold, crimson and cream turn around an abstract cover plate, like a film reel seen face-on. Original motion made for this site — not footage of this cinema, and not from any film.",
    wide: {
      src: "/media/rings.mp4",
      poster: "/media/rings.jpg",
      width: 1920,
      height: 1080,
    },
    durationSeconds: 10,
    fps: 30,
    seamless: true,
    provenance: "original-render",
    derivedFrom: ["ramayana-part-one"],
    renderer: "scripts/render-reel.mts",
  },
};

/** Byte budgets the check suite holds every clip and poster to. */
export const MOTION_MEDIA_BUDGET = {
  videoBytes: 6_000_000,
  posterBytes: 450_000,
} as const;
