module.exports = {
  arrowParens: "always",
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  htmlWhitespaceSensitivity: "ignore",
  insertPragma: false,
  jsxSingleQuote: false,
  printWidth: 100,
  proseWrap: "preserve",
  quoteProps: "as-needed",
  requirePragma: false,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "none",
  useTabs: false,
  vueIndentScriptAndStyle: false,
  overrides: [
    {
      files: ["package.json"],
      options: {
        plugins: [require.resolve("prettier-plugin-packagejson")]
      }
    }
  ]
};
