var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', ['download-testdata'], function () {
    return gulp.src('test/**/*-test.js')
               .pipe(mocha({reporter: 'nyan'}));
});

