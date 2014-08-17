var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('jshint',  function() {
  gulp.src(['./src/js/**/*.js', './spec/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

