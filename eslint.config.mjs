import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {ignores: ["build/"]},
  {files: ["**/*.{js,mjs,cjs,jsx}"]},
  // The server uses require/module.exports; the client (src/) uses import/export
  {files: ["server/**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {react: {version: "detect"}},
    // This project doesn't use PropTypes
    rules: {"react/prop-types": "off"},
  },
];
