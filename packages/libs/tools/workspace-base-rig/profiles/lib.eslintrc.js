require("@rushstack/eslint-config/patch/modern-module-resolution");

module.exports = {
  root: true,
  ignorePatterns: [
    "**/node_modules/**/*",
    "**/node_modules/**/*",
    "**/*.js",
    "**/.env",
    "**/package.json",
    "**/.eslintrc.json",
    "scripts",
    "**/dist/**/*",
    "**/lib/**/*",
    "!src/**/lib/**/*",
    "**/jest.config.js",
    "**/gulpfile.js",
    "**/rollup.config.js",
    "**/tsdx.config.js",
    "**/*.d.ts",
    "**/*.spec.ts",
    "jest.preset.js",
    "**/*.prisma",
    "*.config.ts"
  ],
  extends: [
    "@rushstack/eslint-config/profile/node",
    // "@rushstack/eslint-config/mixins/react",
    // "@rushstack/eslint-config/mixins/friendly-locals",
    "@rushstack/eslint-config/mixins/tsdoc"
  ],
  rules: {},
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      rules: {
        "no-self-compare": "off",
        "no-void": "off",
        "no-redeclare": "off",
        "no-unused-expressions": "off",
        "@rushstack/no-new-null": "off",
        "@rushstack/typedef-var": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/typedef": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-unused-vars": "off",
        eqeqeq: "off",
        "no-lone-blocks": "off",
        "no-throw-literal": "off",
        "no-bitwise": "off",
        "guard-for-in": "off",
        "no-control-regex": "off",
        "max-lines": "off",
        "no-sequences": "off",
        "no-return-assign": "off",
        "@rushstack/security/no-unsafe-regexp": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/naming-convention": "off"
      }
    },
    {
      files: ["*.ts", "*.tsx"],
      extends: [],
      rules: {}
    },
    {
      files: ["*.js", "*.jsx"],
      extends: [],
      rules: {}
    }
  ]
};
