import pluginJs from "@eslint/js";
import nodePlugin from "eslint-plugin-n";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";

const files = ["src/**/*.js", "test_integration/**/*.js", "cli.js", "index.js", "eslint.config.js"];

export default [
  {
    languageOptions: { globals: globals.node },
  },

  { ...pluginJs.configs.recommended, files },
  {
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  { ...eslintPluginUnicorn.configs["flat/recommended"], files },
  {
    rules: {
      "unicorn/prevent-abbreviations": "off",
      // "unicorn/no-null": ["error", { checkStrictEquality: true }],
      "unicorn/no-null": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/switch-case-braces": "off",
    },
  },

  { ...nodePlugin.configs["flat/recommended-module"], files },
  {
    rules: {
      "n/no-unpublished-import": "off",
      "n/no-unsupported-features/node-builtins": [
        "error",
        {
          ignores: ["fetch"],
        },
      ],
    },
  },

  { files },
  {
    ignores: [
      "tmp/",
      "model/",
      "coverage/",
      "/coverage/**",
      "/tmp/**",
      "/model/**",
      "/_gsdata_/**",
      "_gsdata_/",
    ],
  },
];
