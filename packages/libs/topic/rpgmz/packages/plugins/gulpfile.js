const gulp = require("gulp");
gulp.task("deploy", () => {
  return gulp.src(["./dist/*"]).pipe(gulp.dest("../../project/js/plugins/"));
});
