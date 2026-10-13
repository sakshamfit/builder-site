import type { NextConfig } from "next";

/**
 * Artwork hosts, derived from the same allow-list the feed validator enforces.
 *
 * This is the second half of one rule: `lib/feed.ts` refuses to accept a poster
 * URL from a host that is not listed here, and next/image refuses to optimise
 * one. With the list empty — the default — the site can serve no remote image at
 * all, so studio artwork from a source the operator has not licensed cannot
 * reach a page even by accident.
 */
const artworkHosts = (process.env.POSTER_HOST_ALLOWLIST ?? "")
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

/**
 * Next 16 refuses to optimise images from private/loopback addresses unless this
 * is switched on, so it is enabled only when the operator has allow-listed a
 * loopback host — the case that exists purely so `npm run feed:serve` can
 * exercise the artwork pipeline locally. It has no effect on a production
 * allow-list, which names public CDN hosts.
 */
const localArtworkAllowed = artworkHosts.some(
  (host) => host === "127.0.0.1" || host === "::1" || host === "localhost",
);

function artworkRemotePatterns() {
  return artworkHosts.map((hostname) => ({
    protocol: hostname === "127.0.0.1" || hostname === "localhost" ? ("http" as const) : ("https" as const),
    hostname,
    pathname: "/**",
  }));
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Do not advertise the framework in responses.
  poweredByHeader: false,

  // The development server is reached through a proxied preview host in
  // containerised/remote environments. These wildcards keep dev asset requests
  // from being rejected as cross-origin. Development only: no effect on the
  // production server, which should sit behind the confirmed venue domain.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],

  images: {
    // Local artwork is committed under public/. Remote artwork is only possible
    // for hosts the operator has explicitly allow-listed via
    // POSTER_HOST_ALLOWLIST, so nothing can be hot-linked from an unlicensed
    // source (studio artwork, fan media, mall photography) by accident.
    remotePatterns: artworkRemotePatterns(),
    dangerouslyAllowLocalIP: localArtworkAllowed,
    // SVG artwork is refused by the optimiser, which is the safer default: a
    // poster should be a raster image from the partner's asset kit. An SVG
    // supplied anyway falls back to being rendered from its own URL.
    dangerouslyAllowSVG: false,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 360, 420, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [96, 128, 192, 256, 384],
  },
};

export default nextConfig;
