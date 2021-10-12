const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const extensionPath = path.join(os.homedir(), ".vscode/extensions/yuyirai.vscode-advscript-0.1.2")

console.log(extensionPath)
async function symlink(source, target) {
  if (await fs.pathExists(target)) {
    await fs.remove(target);
  }
  await fs.ensureSymlink(source, target);
}
symlink(path.join(__dirname, ".."), extensionPath);
