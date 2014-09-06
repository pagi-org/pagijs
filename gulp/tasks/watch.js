var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('watch', function () {
    var watcher = gulp.watch(['src/**/*.js', 'test/**/*.js'], ['build']);
    return gulp.src('test/**/*-test.js')
               .pipe(mocha({reporter: 'nyan'}));
});

