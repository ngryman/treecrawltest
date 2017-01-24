/// <binding ProjectOpened='default' />

/* eslint-disable */
var gulp = require('gulp'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    es3ify = require("gulp-es3ify"),
    source = require('vinyl-source-stream'),
    gulpIf = require('gulp-if'),
    uglify = require('gulp-uglify'),
    buffer = require('vinyl-buffer'),
    gUtil = require('gulp-util'),
    streamify = require('gulp-streamify'),
    less = require('gulp-less'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    rtlCss = require('gulp-rtlcss'),
    concat = require('gulp-concat'),
    merge = require('merge-stream'),
    eslint = require('gulp-eslint');

var vendors = [];

var vendorPackages = require('./package.json').dependencies;

for (var key in vendorPackages) {
    if (Object.prototype.hasOwnProperty.call(vendorPackages, key)) {
        vendors.push(key);
    }
}

var production = true;

gulp.task('vendors', function () {
    var stream = browserify();

    vendors.forEach(function(item) {
        stream.require(item);
    });

    stream
        .transform(babelify)
        .bundle()
        .pipe(source('react-vendors.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(gulpIf(production, rename('react-vendors.min.js')))
        .pipe(gulpIf(production, buffer()))
        .pipe(gulpIf(production, uglify({ mangle: false })))
        .pipe(gulpIf(production, gulp.dest('assets/js')));

    return stream;
});

function executeTask(entries, fileNamePrefix) {
    var stream = browserify({
        debug: !production,
        entries: entries,
        extensions: ['.js', '.jsx'],
        fullPaths: false
    });

    vendors.forEach(function (vendor) {
        stream.external(vendor);
    });

    return stream
        .transform(babelify)
        .bundle()
        .pipe(source(fileNamePrefix + '.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(gulpIf(production, rename(fileNamePrefix + '.min.js')))
        .pipe(gulpIf(production, buffer()))
        .pipe(gulpIf(production, uglify()))
        .pipe(gulpIf(production, gulp.dest('dist/js')));
}


gulp.task('build-vector6', function () {
    return executeTask(['./main.jsx'], 'vector6-react');
});

gulp.task('default', function () {
    gUtil.log(gUtil.colors.green('Building for: ' + (production
        ? 'PRODUCTION'
        : 'DEVELOPMENT')));
    return gulp.start('vendors');
});
