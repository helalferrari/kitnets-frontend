/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
