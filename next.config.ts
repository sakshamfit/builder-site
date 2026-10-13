import type { NextConfig } from "next";

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
    // Every image is committed to this repository under public/. No remote
    // patterns are configured, so nothing can be hot-linked from an unlicensed
    // source (studio artwork, fan media, mall photography) by accident.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 360, 420, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [96, 128, 192, 256, 384],
  },
};

export default nextConfig;
