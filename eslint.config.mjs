// @ts-check
import eslintPluginAstro from "eslint-plugin-astro";
import {
  baseConfig,
  jsConfig,
  tsConfig,
  reactConfig,
} from "@castiron/eslint-config";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // 1) Global ignores (carried from the old config-ignores.js; src/lib/lint/ dropped)
  {
    ignores: [
      "dist/",
      ".astro/",
      "src/lib/api/gql/",
      "src/lib/stubs/",
      "__schema__/",
      "_sitemaps/",
      "src/types/",
      "graphql-schema.d.ts",
      "**/*.xml.ts",
      "tailwind.config.js",
      "postcss.config.js",
      "astro.config.mjs",
      "eslint.config.mjs",
      "prettier.config.mjs",
      ".graphqlrc.ts",
    ],
  },

  // 2) Shared base — excluded from .astro (Astro is handled by its own config)
  { ...baseConfig, ignores: ["**/*.astro"] },

  // 3) Shared JS + TS (both are files-scoped, so neither matches *.astro)
  jsConfig,
  tsConfig,

  // 4) Register eslint-plugin-react + its recommended rules for JSX/TSX. MUST
  //    precede reactConfig: the shared reactConfig references react/* rules but
  //    does not register the plugin, and its off-switches must win on merge.
  {
    files: ["**/*.{jsx,tsx}"],
    ...react.configs.flat.recommended,
  },

  // 5) Shared React config (turns react-in-jsx-scope + display-name off)
  reactConfig,

  // 5b) Pin the React version. eslint-plugin-react 7.37 has no ESLint 10 support
  //     (latest published); its "detect" path calls context.getFilename(), which
  //     ESLint 10 removed → crash. An explicit version skips detection entirely.
  //     Must come AFTER reactConfig, which sets version: "detect".
  {
    files: ["**/*.{jsx,tsx}"],
    settings: { react: { version: "19.2" } },
  },

  // 5c) react-hooks also lints plain .ts hook files — the shared reactConfig only
  //     covers jsx/tsx, but meru keeps hooks in .ts (e.g. src/hooks/*.ts).
  {
    files: ["**/*.ts"],
    plugins: { "react-hooks": reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  // 5d) Surface hook hints as warnings, not build-breaking errors (matches meru's
  //     long-standing posture for rules-of-hooks). set-state-in-effect is a v7
  //     perf hint that flags intentional hydration / preview-sync effects.
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  // 6) Astro
  ...eslintPluginAstro.configs.recommended,

  // 7a) meru local TS/TSX rule deltas not covered by the shared package.
  //     No import/order: eslint-plugin-import 2.x crashes under ESLint 10
  //     (fixer calls the removed sourceCode.getTokenOrCommentBefore), and
  //     import grouping isn't worth a broken lint run. The package itself stays
  //     installed only to satisfy @castiron/eslint-config's peer requirement.
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "unused-imports/no-unused-imports": "warn",
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },

  // 7b) meru local a11y delta (jsx-a11y is registered by reactConfig for jsx/tsx)
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "jsx-a11y/anchor-is-valid": "warn",
    },
  },

  // 7c) Allow TypeScript triple-slash directives (/// <reference ... />) under
  //     the shared base's spaced-comment rule (scoped off .astro).
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    rules: {
      "spaced-comment": ["error", "always", { markers: ["/"] }],
    },
  },

  // 7d) Prettier owns formatting in the separate-Prettier model, so disable the
  //     shared base's stylistic rules that Prettier already enforces or that
  //     conflict with it (e.g. comma-spacing vs the `<T,>` TSX generic; max-len
  //     vs Prettier's printWidth).
  {
    rules: {
      "comma-spacing": "off",
      "max-len": "off",
      "no-trailing-spaces": "off",
      "no-multiple-empty-lines": "off",
    },
  },
];
