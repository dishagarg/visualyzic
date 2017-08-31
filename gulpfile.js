var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    browserSync = require('browser-sync'),
    del = require('del');

gulp.task('jshint', function() {
  return gulp.src(['./*.js', '!./gulpfile.js'])
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
    gulp.start('usemin', 'imagemin','copyfonts');
});

gulp.task('usemin',['jshint'], function () {
  return gulp.src('./*.html')
      .pipe(usemin({
        css:[minifycss(),rev()],
        js: [uglify(),rev()]
      }))
      .pipe(gulp.dest('dist/'));
});

// Images
gulp.task('imagemin', function() {
  return del(['dist/images']), gulp.src('images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images task complete' }));
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
  gulp.watch('{./*.js,./styles/*.css,./*.html}', ['usemin']);
      // Watch image files
  gulp.watch('images/*', ['imagemin']);

});

gulp.task('browser-sync', ['default'], function () {
   var files = [
      './*.html',
      './styles/*.css',
      './images/*.png',
      './*.js',
      './bower_components/**/*',
      'dist/**/*'
   ];

   browserSync.init(files, {
      server: {
         baseDir: "dist",
         index: "index.html"
      }
   });
        // Watch any files in dist/, reload on change
  //gulp.watch(['dist/**']).on('change', browserSync.reload);
});
