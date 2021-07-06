var gulp = require("gulp");
var cssnano = require("gulp-cssnano");
var sass = require("gulp-sass")(require("sass"));
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var gulpIf = require("gulp-if");
var browserSync = require("browser-sync").create();
var useref = require("gulp-useref");
var imagemin = require("gulp-imagemin");
var del = require("del");
var runSequence = require("run-sequence");

gulp.task("sass", function () {
  return gulp
    .src("app/scss/**/*.scss")
    .pipe(sass())
    .pipe(gulp.dest("app/css"))
    .pipe(
      browserSync.reload({
        stream: true,
      }),
    );
});

gulp.task("js", function () {
  return gulp
    .src(["app/js/plugins/*.js", "app/js/*.js"])
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(gulp.dest("dist"));
});

gulp.task("browserSync", function () {
  browserSync.init({
    server: {
      baseDir: "app",
    },
  });
});

gulp.task("useref", function () {
  return (
    gulp
      .src("app/*.html")
      .pipe(useref())
      .pipe(gulpIf("*.js", uglify()))
      // Minifies only if it's a CSS file
      .pipe(gulpIf("*.css", cssnano()))
      .pipe(gulp.dest("dist"))
  );
});

gulp.task("images", function () {
  return gulp
    .src("app/images/**/*.+(png|jpg|gif|svg)")
    .pipe(
      cache(
        imagemin({
          interlaced: true,
        }),
      ),
    )
    .pipe(gulp.dest("dist/images"));
});

gulp.task("fonts", function () {
  return gulp.src("app/fonts/**/*").pipe(gulp.dest("dist/fonts"));
});

gulp.task("watch", function () {
  gulp.watch("app/scss/**/*.scss", gulp.series("sass"));
  // Reloads the browser whenever HTML or JS files change
  gulp.watch("app/*.html", browserSync.reload);
  gulp.watch("app/js/**/*.js", browserSync.reload);
  browserSync.init({
    server: {
      baseDir: "app",
    },
  });
});

gulp.task("clean:dist", function () {
  return del.sync("dist");
});

gulp.task("cache:clear", function (callback) {
  return cache.clearAll(callback);
});

gulp.task("build", function (callback) {
  runSequence("clean:dist", ["sass", "useref", "images", "fonts"], callback);
});

/*gulp.task("default", function (callback) {
  runSequence(["sass", "browserSync", "watch"], callback);
});*/

gulp.task("default", gulp.series("sass", "js", "watch"));
