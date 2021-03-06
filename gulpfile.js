var gulp = require('gulp')
var runSequence = require('run-sequence')
var less = require('gulp-less')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var cleanCSS = require('gulp-clean-css')
var rename = require('gulp-rename')
var run = require('gulp-run');


var themeCssSrc = './themes/hugo-future-imperfect-modified/static/css/';
var themeJsSrc = './themes/hugo-future-imperfect-modified/static/js/';

gulp.task('js:build', function() {
  return gulp.src(['./static/js/jquery.min.js', 
                  './static/js/skel.min.js', 
                  './static/js/util.js', 
                  './static/js/main.js', 
                  './static/js/backToTop.js', 
                  './static/js/highlight.pack.js'])
    .pipe(concat('site.js'))
    .pipe(gulp.dest('./static/js/'))
    .pipe(rename('site.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./static/js/'));
});

gulp.task('css:build', function() {
  return gulp.src(['./static/css/google-font.css', 
                  './static/css/font-awesome.min.css', 
                  './static/css/main.css', 
                  './static/css/add-on.css', 
                  './static/css/monokai-sublime.css', 
                  './static/css/more.css'])
    .pipe(concat('site.css'))
    .pipe(gulp.dest('./static/css/'))
    .pipe(rename('site.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./static/css/'));
});


// gulp.task('hugo', function () {
//   return exec('hugo --config config.production.toml', function (err, stdout, stderr) {
//       console.log(stdout); // See Hugo output
//       console.log(stderr); // Debugging feedback
//       //fetch(err);
//   });
// })

// gulp.task('hugo', function () {
//   return cp.execFile('hugo --config config.production.toml');
// })

gulp.task('hugoit', function() {
  return run('hugo --config config.production.toml').exec();
})


gulp.task('build', runSequence('js:build', 'css:build', 'hugoit'));

gulp.task('default', ['less:main', 'less:watch']);
