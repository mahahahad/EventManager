import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    env: {
        FORTY_TWO_CLIENT_ID: process.env.FORTY_TWO_CLIENT_ID,
        FORTY_TWO_REDIRECT_URI: process.env.FORTY_TWO_REDIRECT_URI,
    },
};

export default nextConfig;
