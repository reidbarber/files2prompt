/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/files2prompt",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
