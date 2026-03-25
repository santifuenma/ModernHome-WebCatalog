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

    async headers() {
        const isProd = process.env.NODE_ENV === 'production'

        // CSP is only enforced in production.
        // In development, Turbopack needs unrestricted connect/script access
        // for HMR WebSockets and RSC payload fetches — the CSP would block them.
        const cspHeader = isProd
            ? [
                {
                    key: 'Content-Security-Policy',
                    value: [
                        "default-src 'self'",
                        "script-src 'self' 'unsafe-inline'",
                        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                        "font-src 'self' https://fonts.gstatic.com",
                        "img-src 'self' data: blob: https://res.cloudinary.com",
                        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com",
                        "object-src 'none'",
                        "frame-ancestors 'none'",
                    ].join('; '),
                },
            ]
            : []

        return [
            {
                source: '/(.*)',
                headers: [
                    // These are safe and useful in all environments
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    ...cspHeader,
                ],
            },
        ]
    },
};

export default nextConfig;

