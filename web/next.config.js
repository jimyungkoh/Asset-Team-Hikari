// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-08
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: serverActions configuration removed in Next.js 16
  // bodySizeLimit is now handled at the route handler level if needed
  turbopack: {
    // Set root to parent directory to include workspace root
    root: require("path").resolve(__dirname, ".."),
  },
};

module.exports = nextConfig;
