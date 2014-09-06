var gulp = require('gulp');
var browserify = require('gulp-browserify');

gulp.task('browserify', function () {
    return gulp.src('src/js/pagi.js')
               .pipe(browserify({
                 insertGlobals : true,
                 debug : true
               }))
               .pipe(gulp.dest('./build/js'))
});

