/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '*.run.app',
    'localhost:3000',
    'localhost:8080',
    'ais-dev-sycl7zc7jezr46ef6dkdsj-788140182808.asia-southeast1.run.app',
    'ais-pre-sycl7zc7jezr46ef6dkdsj-788140182808.asia-southeast1.run.app',
  ],
};

export default nextConfig;
