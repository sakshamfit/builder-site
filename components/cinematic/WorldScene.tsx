import Image from "next/image";
import { constellationTiles, type LanguageCount } from "@/lib/cinematic";
import { formatDateShort } from "@/lib/date-format";
import styles from "./cinematic.module.css";

/**
 * Where each plate rests before the scene gathers them — pk's scatter and the
 * tilts it uses, as percentages of the stage, with a second set for phones
 * that keeps the plates below the copy. They are data, not inline styles: the
 * plain (unpinned) layout is a grid, and an inline offset would push each plate
 * out of its cell. `CinematicMotion` applies them once the stage is pinned.
 */
const SCATTER = [
  { left: 50, top: 12, mLeft: 10, mTop: 55, r: -5, ry: -9 },
  { left: 78, top: 16, mLeft: 62, mTop: 52, r: 4, ry: 12 },
  { left: 64, top: 40, mLeft: 36, mTop: 64, r: -3, ry: 0 },
  { left: 84, top: 62, mLeft: 74, mTop: 74, r: 3, ry: 0 },
  { left: 52, top: 68, mLeft: 16, mTop: 79, r: -5, ry: 0 },
];

/**
 * The season — a dark stage, the languages of the programme, and five plates
 * that gather into a line as the reader scrolls.
 *
 * Adapted from the `.world` scene in the owner's `gireeshkumarreddy/pk`
 * repository (ASSET_CREDITS.md §11), where scattered stills gather into a
 * column. Those stills are landscape; these plates are portrait, so here they
 * gather into a row — a line of posters on a wall — and a caption arrives with
 * them saying what they are.
 *
 * The languages are counted from the programme, most-represented first. The
 * scene says nothing the film pages do not.
 */
export function WorldScene({
  languages,
  filmCount,
  span,
}: {
  languages: LanguageCount[];
  filmCount: number;
  span: { first: string; last: string } | null;
}) {
  const tiles = constellationTiles();
  const labels = languages.map((language) => language.label);
  const lineOne = labels.slice(0, 2);
  const lineTwo = labels.slice(2, 4);
  const rest = labels.length - lineOne.length - lineTwo.length;

  return (
    <section
      className={styles.world}
      data-scene="world"
      data-tone="dark"
      data-mode="night"
      aria-labelledby="world-title"
    >
      <div className={styles.worldStage}>
        <div className={styles.worldCopy} data-j="worldCopy">
          <p className={styles.kicker}>
            <span>A season of stories</span>
          </p>
          <h2 className={styles.worldTitle} id="world-title">
            {lineOne.map((label) => `${label}.`).join(" ")}
            {lineTwo.length ? (
              <>
                <br />
                {lineTwo.map((label) => `${label}.`).join(" ")}
              </>
            ) : null}
            <br />
            <em>{rest > 0 ? `And ${rest} more.` : `${labels.length} languages, one programme.`}</em>
          </h2>
          <p className={styles.worldMeta}>
            {filmCount} films in the programme
            {span ? ` · ${formatDateShort(span.first)} to ${formatDateShort(span.last)}` : ""}
          </p>
        </div>

        <div className={styles.constellation} aria-hidden="true">
          {tiles.map((src, index) => {
            const rest = SCATTER[index % SCATTER.length];
            return (
              <div
                key={src}
                className={styles.star}
                data-j="star"
                data-index={index}
                data-r={rest.r}
                data-ry={rest.ry}
                data-left={rest.left}
                data-top={rest.top}
                data-m-left={rest.mLeft}
                data-m-top={rest.mTop}
              >
                <Image src={src} alt="" fill sizes="(max-width: 700px) 30vw, 200px" />
              </div>
            );
          })}
        </div>

        <p className={styles.worldCaption} data-j="worldCaption">
          Original cover art for five films in the programme — not their posters.
        </p>
      </div>
    </section>
  );
}
