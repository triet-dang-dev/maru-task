import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import queryPlugin from "@tanstack/eslint-plugin-query";

const queryRecommended = queryPlugin.configs["flat/recommended"];

export default defineConfig([
  {
    ignores: [".next/**", "coverage/**", "dist/**", "node_modules/**", "out/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  ...queryRecommended,
]);
