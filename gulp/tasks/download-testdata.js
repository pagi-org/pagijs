var gulp = require('gulp');
var download = require('gulp-download');
var gunzip = require('gulp-gunzip');
var untar = require('gulp-untar2');
var rename = require('gulp-rename');
var fs = require('fs');

var url = "https://github.com/pagi-org/test-suite/archive/master.tar.gz";

gulp.task('download-testdata', function() {
  var dest = 'build/test-suite';
  if (fs.existsSync(dest)) {
    console.log("Test data already exists, not downloading...");
  } else {
    return download(url)
           .pipe(gunzip())
           .pipe(untar())
           .pipe(rename(function (path) {
             // removes the first directory from the dirname, accounting for dirs 
             // that only consist of a single directory (and have no trailing slash)
  	   path.dirname = path.dirname.replace(/[^\/]*\/?/, "");
            }))
           .pipe(gulp.dest(dest))
  }
});

