/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["opensea.mypinata.cloud"],
  },
};

module.exports = nextConfig;
