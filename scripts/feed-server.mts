/**
 * A local stand-in for the venue's ticketing partner.
 *
 *     npm run feed:serve
 *
 * Serves the test payload from `scripts/feed-fixtures.mts` on
 * http://127.0.0.1:4100, along with placeholder poster images, so the entire live
 * path can be exercised for real over HTTP: fetch, timeout handling, validation,
 * artwork allow-listing, rendering and the booking handoff.
 *
 * Then, in another terminal:
 *
 *     NEXT_PUBLIC_DATA_MODE=live \
 *     SCHEDULE_FEED_URL=http://127.0.0.1:4100/programme.json \
 *     POSTER_HOST_ALLOWLIST=127.0.0.1 \
 *     npm run dev
 *
 * Extra endpoints for exercising the failure paths:
 *   /programme.json          the valid payload
 *   /no-artwork.json         valid, but with no poster URLs at all
 *   /broken.json             malformed JSON (simulates a truncated response)
 *   /slow.json               responds after 30s, to trip the 8s timeout
 *   /unauthorised.json       401, to prove the token hint appears
 *   /stale.json              a valid payload generated three days ago
 *
 * This is a development tool. It is never imported by the app.
 */

import { createServer } from "node:http";
import sharp from "sharp";
import { buildValidFeed, TEST_ARTWORK_HOST } from "./feed-fixtures.mts";

const PORT = Number(process.env.FEED_PORT ?? 4100);
const HOST = "0.0.0.0";

const json = (body: string, status = 200) => ({
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  body,
});

function posterSvg(title: string): string {
  // A deliberately plain placeholder tile. It carries no brand, no film imagery
  // and no studio mark — it exists only to prove the artwork path works.
  const label = title.toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
  <rect width="800" height="1200" fill="#e0dbcb"/>
  <rect x="24" y="24" width="752" height="1152" fill="none" stroke="#1c1a17" stroke-width="3"/>
  <text x="400" y="570" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="52" font-weight="700" fill="#1c1a17">${label}</text>
  <text x="400" y="640" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#8a8471">placeholder artwork</text>
  <text x="400" y="1080" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#8a8471">not a film poster</text>
</svg>`;
}

/** Renders the placeholder tile to PNG, so the optimiser path is exercised. */
async function rasterisePoster(title: string): Promise<Buffer> {
  return sharp(Buffer.from(posterSvg(title))).png().toBuffer();
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? HOST}`);
  const send = (payload: { status: number; headers: Record<string, string>; body: string }) => {
    response.writeHead(payload.status, payload.headers);
    response.end(payload.body);
  };

  console.log(`[feed] ${request.method} ${url.pathname}`);

  switch (url.pathname) {
    case "/programme.json":
    case "/":
      return send(json(JSON.stringify(buildValidFeed(), null, 2)));

    case "/no-artwork.json":
      return send(json(JSON.stringify(buildValidFeed({ includeArtwork: false }), null, 2)));

    case "/stale.json":
      return send(
        json(
          JSON.stringify(
            buildValidFeed({ nowISO: new Date(Date.now() - 72 * 3_600_000).toISOString() }),
            null,
            2,
          ),
        ),
      );

    case "/broken.json":
      return send({
        status: 200,
        headers: { "content-type": "application/json" },
        // Truncated mid-object, the classic symptom of a partner timeout.
        body: '{"version":1,"venueId":"elante-chandigarh","movies":[{"slug":"placeholder-film-a"',
      });

    case "/unauthorised.json":
      return send(json(JSON.stringify({ error: "invalid token" }), 401));

    case "/slow.json":
      setTimeout(() => send(json(JSON.stringify(buildValidFeed()))), 30_000);
      return;

    default: {
      /*
       * Raster, not SVG: the image optimiser refuses SVG by default, and a real
       * asset kit ships JPEG or PNG posters. rasterisePoster uses the same sharp
       * the production image pipeline uses.
       */
      const match = /^\/posters\/([a-z0-9-]+)\.png$/.exec(url.pathname);
      if (match) {
        void rasterisePoster(match[1].replace(/-/g, " ")).then((buffer) => {
          response.writeHead(200, {
            "content-type": "image/png",
            "cache-control": "public, max-age=60",
          });
          response.end(buffer);
        });
        return;
      }
      return send(json(JSON.stringify({ error: "not found" }), 404));
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[feed] test schedule feed on http://${TEST_ARTWORK_HOST}:${PORT}/programme.json`);
  console.log(`[feed] run the site with:`);
  console.log(`[feed]   NEXT_PUBLIC_DATA_MODE=live \\`);
  console.log(`[feed]   SCHEDULE_FEED_URL=http://${TEST_ARTWORK_HOST}:${PORT}/programme.json \\`);
  console.log(`[feed]   POSTER_HOST_ALLOWLIST=${TEST_ARTWORK_HOST} \\`);
  console.log(`[feed]   npm run dev`);
});
