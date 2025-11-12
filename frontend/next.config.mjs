/** @type {import('next').NextConfig} */
const nextConfig = {
  // This 'images' block is what you are adding.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Added this one too, as your Discover feed uses it!
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

// Use 'export default' for .mjs files
export default nextConfig;