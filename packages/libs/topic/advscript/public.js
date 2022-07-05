const fs = require("fs-extra");

if (fs.pathExistsSync("./public")) {
  fs.removeSync("./public");
}
fs.symlinkSync("F:/SteamLibrary/steamapps/common/TyranoBuilder/myproject/test", "./public");
