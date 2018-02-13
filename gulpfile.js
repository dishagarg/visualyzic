/* jshint node:true */
/* eslint comma-dangle: ["error", "never"] */
'use strict';

var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var imagemin = require('gulp-imagemin');
var notify = require('gulp-notify');
var cache = require('gulp-cache');
var rev = require('gulp-rev');
var browserSync = require('browser-sync');
var del = require('del');

gulp.task('jshint', function() {
  return gulp.src(['./**/*.js', '!./gulpfile.js'])
  .pipe(jshint())
  .pipe(jshint.reporter(stylish))
  .pipe(gulp.dest('dist/'));
});

// Clean
gulp.task('clean', function() {
    return del(['dist']);
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('usemin', 'imagemin', 'copyfonts');
});

gulp.task('usemin', ['jshint'], function() {
  return gulp.src('./**/*.html')
      .pipe(usemin({
        css: [minifycss(), rev()],
        js: [uglify(), rev()]
      }))
      .pipe(gulp.dest('dist/'));
});

// Images
gulp.task('imagemin', function() {
  return del(['dist/images']), gulp.src('images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true})))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({message: 'Images task complete'}));
});

gulp.task('copyfonts', ['clean'], function() {
   gulp.src('./bower_components/**/*', {
        base: 'bower_components'
    }).pipe(gulp.dest('./dist/bower_components/'));
   gulp.src('./styles/**/*', {
        base: 'styles'
    }).pipe(gulp.dest('./dist/styles/'));
});

// Watch
gulp.task('watch', ['browser-sync'], function() {
  // Watch .js files
  gulp.watch('{./src/*.js, ./styles/*.css, ./**/*.html}', ['usemin']);
      // Watch image files
  gulp.watch('images/*', ['imagemin']);
});

gulp.task('browser-sync', ['default'], function() {
   var files = [
      './**/*.html',
      './styles/*.css',
      './images/*.png',
      './**/*.js',
      './bower_components/**/*',
      'dist/**/*'
   ];
   browserSync.init(files, {
      server: {
         baseDir: 'dist',
         index: 'index.html'
      }
   });
        // Watch any files in dist/, reload on change
  // gulp.watch(['dist/**']).on('change', browserSync.reload);
});
