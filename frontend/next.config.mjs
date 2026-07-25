import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Explicitly set root to this frontend directory to suppress the
    // "multiple lockfiles detected" warning from the parent Hardhat workspace.
    root: __dirname,
  },
};
export default nextConfig;
