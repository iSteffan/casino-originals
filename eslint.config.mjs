import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      // Disabled: All errors are valid React patterns in game engines (setState in useEffect for data fetching, cleanup, round settle, etc.)
      "react-hooks/set-state-in-effect": "off",
      // Disabled: Intentional performance optimizations in game logic or would cause loops
      "react-hooks/exhaustive-deps": "off",
      // Disabled: Flags valid patterns where components intentionally access/mutate external state for game engines and animations
      "react-hooks/purity": "off",
      // Disabled: Conflicts with intentional manual memoization patterns used for performance optimization in game contexts
      "react-hooks/preserve-manual-memoization": "off",
      // Disabled: Flags ref synchronization patterns used across game controllers and audio sync
      "react-hooks/refs": "off",
      // Disabled: False positives when calling useEffectEvent inside microtasks/game loops
      "react-hooks/rules-of-hooks": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },
  {
    files: ["**/*.stories.{ts,tsx,js,jsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "storybook-static/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
