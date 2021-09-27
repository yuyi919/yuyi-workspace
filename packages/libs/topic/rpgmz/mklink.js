const fs = require("fs-extra");

async function symlink(source, target) {
  if (await fs.pathExists(target)) {
    await fs.remove(target);
  }
  await fs.ensureSymlink(source, target);
}

symlink("D:\\Workspace\\RMMZ\\VOICEROID剧场", "./project");
