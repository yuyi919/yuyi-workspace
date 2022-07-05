module.exports = {
  extends: ["./node_modules/@yuyi919/workspace-base-rig/profiles/lib.eslintrc"],
  parserOptions: { tsconfigRootDir: __dirname },
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      rules: {}
    }
  ]
};
