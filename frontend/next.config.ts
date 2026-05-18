import type { NextConfig } from "next";
import { env } from "./app/env";

const apiUrl = new URL(env.NEXT_PUBLIC_TCG_API_URL);

// Validate protocol
const protocol = apiUrl.protocol.replace(':', '');
if (protocol !== 'http' && protocol !== 'https') {
    throw new Error(`Unsupported protocol: ${protocol}`);
}

const nextConfig: NextConfig = {
    allowedDevOrigins: ['192.168.0.159'],
    images: {
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
                protocol,
                hostname: apiUrl.hostname,
                port: apiUrl.port
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            }
        ]
    }
};

export default nextConfig;
