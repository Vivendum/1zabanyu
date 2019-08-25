"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var changed = require("gulp-changed");
var sourcemap = require("gulp-sourcemaps");
var rigger = require("gulp-rigger");
var htmlmin = require("gulp-htmlmin");
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var prefix = require("autoprefixer");
var cssmin = require("gulp-csso");
var jsmin = require("gulp-uglify");
var rename = require("gulp-rename");
var replace_name = require("gulp-ext-replace");
var server = require("browser-sync").create();

gulp.task("html:build", function () {
  return gulp.src("source/*.html")
    .pipe(plumber())
    .pipe(changed("build/"))
    .pipe(rigger())
    .pipe(gulp.dest("build/"))
    .pipe(htmlmin())
    .pipe(rename({
      suffix(".min")
    }))
    .pipe(gulp.dest("build/"))
    .pipe(server.stream());
});

gulp.task("html:fit", function () {
  return gulp.src("build/*.min.html")
    .pipe(plumber())
    .pipe(changed("fit/"))
    .pipe(replace_name(".min.html", ".html"))
    .pipe(gulp.dest("fit/"));
});

gulp.task("style:build", function () {
  return gulp.src("source/style/*.less")
    .pipe(plumber())
    .pipe(changed("build/style/"))
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      prefix()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/style/"))
    .pipe(cssmin())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("build/style/"))
    .pipe(server.stream());
});

gulp.task("style:fit", function () {
  return gulp.src("build/style/*.min.css")
    .pipe(plumber())
    .pipe(changed("fit/style/"))
    .pipe(cssmin({
      sourcemap: false
    }))
    .pipe(gulp.dest("fit/style/"));
});

gulp.task("script:build", function () {
  return gulp.src("source/script/*.js")
    .pipe(plumber())
    .pipe(changed("build/script/"))
    .pipe(sourcemap.init())
    .pipe(rigger())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/script/"))
    .pipe(jsmin())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("build/script/"))
    .pipe(server.stream());
});

gulp.task("script:fit", function () {
  return gulp.src("build/script/*min.js")
    .pipe(plumber())
    .pipe(changed("fit/script/"))
    .pipe(gulp.dest("fit/script/"));
});

gulp.task("server", function () {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false,
    browser: "firefox"
  });

  gulp.watch("source/script/**/*.js", gulp.series("script:build"));
  gulp.watch("source/style/**/*.less", gulp.series("style:build"));
  gulp.watch("source/**/*.html").on("change", server.reload);
});

gulp.task("start:build", gulp.series("html:build", "style:build", "script:build"));
gulp.task("start:fit", gulp.series("html:fit", "style:fit", "script:fit"));
gulp.task("start", gulp.series("html:build", "style:build", "script:build", "server"));
