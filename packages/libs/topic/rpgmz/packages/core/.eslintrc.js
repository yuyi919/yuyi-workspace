module.exports = {
  extends: ["./node_modules/@yuyi919/workspace-base-rig/profiles/shared.eslintrc"],
  parserOptions: { tsconfigRootDir: __dirname },
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      rules: {
        "prefer-rest-params": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/member-ordering": "off",
        "tsdoc/syntax": "off",
        "guard-for-in": "off"
      }
    }
  ]
};
