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
                        // Cloudinary Upload Widget loads from upload-widget.cloudinary.com
                        "script-src 'self' 'unsafe-inline' https://upload-widget.cloudinary.com",
                        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://upload-widget.cloudinary.com",
                        "font-src 'self' https://fonts.gstatic.com",
                        // Widget also loads thumbnails/previews from res.cloudinary.com
                        "img-src 'self' data: blob: https://res.cloudinary.com https://upload-widget.cloudinary.com",
                        // Widget uploads directly to Cloudinary API and needs its own connect endpoints
                        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com https://upload-widget.cloudinary.com https://res.cloudinary.com",
                        // Widget renders inside an iframe hosted on upload-widget.cloudinary.com
                        "frame-src https://upload-widget.cloudinary.com",
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

