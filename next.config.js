/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/product/details",
        destination: "/product",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
