// Import env to trigger validation at build/boot time.
// Using jiti lets us load the TS file from an ESM config.
import { createJiti } from "jiti"
const jiti = createJiti(import.meta.url)
await jiti.import("./lib/env.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
