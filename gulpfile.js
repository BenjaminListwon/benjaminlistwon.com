var gulp = require('gulp')
var less = require('gulp-less')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var cleanCSS = require('gulp-clean-css')
var rename = require('gulp-rename')
var run = require('gulp-run');


var themeCssSrc = './themes/hugo-future-imperfect-modified/static/css/';
var themeJsSrc = './themes/hugo-future-imperfect-modified/static/js/';


gulp.task('less:main', function() {
  gulp.src('themes/a-life-alone-2016/static/less/style.less')
    .pipe(less({
      paths: [ 'themes/a-life-alone-2016/static/less' ]
    }))
    .pipe(gulp.dest('themes/a-life-alone-2016/static/css/'))
});

gulp.task('less:watch', function() {
  gulp.watch(['themes/a-life-alone-2016/static/less/**/*.less'], ['less:main']);
});

gulp.task('js:build', function() {
  return gulp.src(['./themes/hugo-future-imperfect-modified/static/js/jquery.min.js', 
                  './themes/hugo-future-imperfect-modified/static/js/skel.min.js', 
                  './themes/hugo-future-imperfect-modified/static/js/util.js', 
                  './themes/hugo-future-imperfect-modified/static/js/main.js', 
                  './themes/hugo-future-imperfect-modified/static/js/backToTop.js', 
                  './themes/hugo-future-imperfect-modified/static/js/highlight.pack.js'])
    .pipe(concat('site.js'))
    .pipe(gulp.dest('./static/js/'))
    .pipe(rename('site.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./static/js/'));
});

gulp.task('css:build', function() {
  return gulp.src(['./themes/hugo-future-imperfect-modified/static/css/google-font.css', 
                  './themes/hugo-future-imperfect-modified/static/css/font-awesome.min.css', 
                  './themes/hugo-future-imperfect-modified/static/css/main.css', 
                  './themes/hugo-future-imperfect-modified/static/css/add-on.css', 
                  './themes/hugo-future-imperfect-modified/static/css/monokai-sublime.css', 
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

gulp.task('hugo', function() {
  return run('hugo --config config.production.toml').exec();
})


gulp.task('build', ['js:build', 'css:build', 'hugo']);

gulp.task('default', ['less:main', 'less:watch']);
