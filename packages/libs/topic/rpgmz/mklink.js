const fs = require("fs-extra");

symlink("D:\\Workspace\\RMMZ\\VOICEROID剧场", "./web");

async function symlink(source, target) {
  if (await fs.pathExists(target)) {
    await fs.remove(target);
  }
  await fs.ensureSymlink(source, target);
}
