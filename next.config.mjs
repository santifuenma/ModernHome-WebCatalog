/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
        // Cache processed images for 7 days on the server
        // Reduces re-processing Cloudinary images on every request
        minimumCacheTTL: 604800,
    },
};

export default nextConfig;
