/**
 * next.config.mjs
 * Next.js configuration for the Doctor Tracker client.
 * (Tailwind CSS is set up through postcss.config.mjs.)
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't reuse Turbopack's on-disk dev cache between restarts: it kept serving
  // stale CSS after globals.css changed. A restart now always rebuilds styles.
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },

  // Proxy every /api/* request to the Express server.
  // The browser then only talks to one origin, so the auth cookie works
  // without any CORS / cross-site cookie setup.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:5000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
