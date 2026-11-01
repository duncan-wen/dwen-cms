import type { NextConfig } from "next";
import { getContent } from "./src/content/site-content";

const nextConfig = async (): Promise<NextConfig> => ({
  env: {
    // The proxy can't read content at request time, so it gets the
    // taken-down Slugs at build time, comma-separated.
    TAKEN_DOWN_SLUGS: (await getContent()).listTakenDownSlugs().join(","),
  },
});

export default nextConfig;
