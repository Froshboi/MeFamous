import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "android/**", "ios/**", "mobile/**"],
  },
];

export default eslintConfig;
