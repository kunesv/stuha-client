'use strict';

var gulp = require('gulp');

var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var sequence = require('run-sequence');
var rimraf = require('rimraf');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var webserver = require('gulp-webserver');


var paths = {
    assets: [
        './src/**/*.*',
        '!./src/{scss,js}/**/*.*'
    ],
    // Sass
    sass: [
        './src/scss/**/*.scss'
    ],
    // JavaScript dependencies
    libs: [
        './node_modules/babel-polyfill/dist/polyfill.js'
    ],
    // These files are for your app's JavaScript
    app: [
        './src/**/*.js'
    ]
};

// Default task: builds your app, starts a server, and recompiles assets when they change
gulp.task('default', ['server'], function () {
    // Watch Sass
    gulp.watch(['./src/scss/**/*', './scss/**/*'], ['sass']);

    // Watch JavaScript
    gulp.watch(paths.app, ['uglify:app']);

    // Watch static files
    gulp.watch(['./src/**/*.*', '!./src/templates/**/*.*', '!./src/{scss,js}/**/*.*'], ['copy']);

    // Watch app templates
    gulp.watch(['./src/templates/**/*.html'], ['copy:templates']);
});

gulp.task('clean', function (cb) {
    rimraf('./build', cb);
});

// Copies everything in the client folder except templates, Sass, and JS
gulp.task('copy', function () {
    return gulp.src(paths.assets, {
        base: './src/'
    }).pipe(gulp.dest('./build'));
});

// Builds your entire app once, without starting a server
gulp.task('build', function (cb) {
    sequence('clean', ['copy', 'sass', 'uglify'], cb);
});

gulp.task('uglify', ['uglify:assets', 'uglify:app']);

gulp.task('uglify:assets', function () {
    return gulp.src(paths.libs)
        .pipe(uglify())
        .pipe(gulp.dest('./build/js/'));
});

gulp.task('uglify:app', function () {
    return gulp.src(paths.app)
    // .pipe(concat('app.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./build/'));
});

// Compiles Sass
gulp.task('sass', function () {
    return gulp.src(paths.sass)
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 10']
        }))
        .pipe(gulp.dest('./build/css/'))
        ;
});

let webserverSettings = {
    port: process.env.PORT,
    host: '0.0.0.0',
    fallback: 'index.html'
};

if (!process.env.PORT) {
    webserverSettings.port = 5000;
    webserverSettings.https = true;
    webserverSettings.proxies = [{
        source: '/api/',
        target: 'http://localhost:8080/'
    }];
}

// Starts a test server, which you can view at http://localhost:3000
gulp.task('server', ['build'], function () {
    gulp.src('./build')
        .pipe(webserver(webserverSettings))
    ;
});
