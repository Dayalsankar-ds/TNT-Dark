import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored maplibre worker bundles, copied verbatim from node_modules and
    // served from the web root (see mapcn-map-route.tsx). Not our source.
    "public/maplibre-gl-*.mjs",
  ]),
]);

export default eslintConfig;
