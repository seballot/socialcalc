var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
let cleanCSS = require('gulp-clean-css');
var filesExist = require('files-exist');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var gutil = require('gulp-util');

var js_folder = 'src/js/';
var css_folder = 'src/css/';
var dist_folder = 'dist/';
var assets_folder = 'web/assets/';

var js_top_file = js_folder + 'module-wrapper-top.js';
var js_bottom_file = js_folder + 'module-wrapper-bottom.js';

var js_files = [
    js_folder + 'socialcalcconstants.js',
    js_folder + 'socialcalc-3.js',
    js_folder + 'socialcalctableeditor.js',
    js_folder + 'formatnumber2.js',
    js_folder + 'formula1.js',
    js_folder + 'socialcalcpopup.js',
    js_folder + 'socialcalcspreadsheetcontrol.js',
    js_folder + 'socialcalcviewer.js'
];

gulp.task('validate-js', function () {
    return gulp.src(js_files)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// compiling javascript and css files
gulp.task('js', function () {
    var files = filesExist([].concat(js_top_file, js_files, js_bottom_file));
    return gulp.src(files)
        .pipe(concat('SocialCalc.js'))
        .pipe(gulp.dest(assets_folder));
});

gulp.task('css', function () {
  return gulp.src([css_folder + '**/*.scss'])
    .pipe(sass().on('error', sass.logError)) 
    .pipe(concat('SocialCalc.css')) 
    .pipe(gulp.dest(assets_folder));
});

gulp.task('watch', function() 
{
  gulp.watch(['src/css/**/*'], ['css']);
  gulp.watch(['src/js/**/*'], ['js']);
});

gulp.task('build', ['js', 'css'], function () {});

gulp.task('default', ['build'], function () {});


// Generate production files into dist folder
gulp.task('move_assets', function() {
   gulp.src([assets_folder + 'images/*']).pipe(gulp.dest(dist_folder + 'images/'));
   return gulp.src([assets_folder + '*.css', assets_folder + '*.js']).pipe(gulp.dest(dist_folder));
});

gulp.task('minify_js', function() {
  return gulp.src(dist_folder + 'SocialCalc.js')
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest(dist_folder));
});

gulp.task('minify_css', function() {
  gulp.src([assets_folder + '*.css']).pipe(gulp.dest(dist_folder));
  return gulp.src(dist_folder + 'SocialCalc.css')
    .pipe(rename({suffix: '.min'}))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(dist_folder));
});

gulp.task('dist', ['move_assets'], function() {
  gulp.start('minify_js', 'minify_css');
});