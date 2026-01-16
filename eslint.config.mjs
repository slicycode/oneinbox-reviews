import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".source/**"
  ]
}, {
  files: ["src/components/tailark/**/*.tsx"],
  rules: {
    "@next/next/no-img-element": "off"
  }
}];

export default eslintConfig;
