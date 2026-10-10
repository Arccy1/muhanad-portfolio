/** @type {import('next').NextConfig} */

// STATIC_EXPORT=1 (set by scripts/build-static.mjs) produces a fully static
// build of the visitor-facing site for GitHub Pages. The normal build stays
// a full-stack server app (admin panel + API + database).
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    ...(isStaticExport ? { unoptimized: true } : {}),
  },
  // Security headers for the full-stack server (admin panel + API).
  // Static exports for GitHub Pages are served by GitHub, which sets its own.
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Frame-Options", value: "DENY" },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=()",
                },
                {
                  key: "Content-Security-Policy",
                  value:
                    "default-src 'self'; img-src 'self' data: https:; media-src 'self' https:; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ws: wss:; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
                },
              ],
            },
          ];
        },
      }),
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        // GitHub Pages project sites live under /<repo-name>/
        basePath: "/muhanad-portfolio",
      }
    : {}),
};

export default nextConfig;
