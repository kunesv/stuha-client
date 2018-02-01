'use strict';

const gulp = require('gulp');

const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const sequence = require('run-sequence');
const rimraf = require('rimraf');
const uglify = require('gulp-uglify');
const watch = require('gulp-watch');
const webserver = require('gulp-webserver');
const svgmin = require('gulp-svgmin');

const paths = {
    images: {
        svg: ['./src/**/*.svg'],
        png: ['./src/**/*.png']
    },
    // Sass
    sass: [
        './src/scss/**/*.scss'
    ],
    // JavaScript dependencies
    libs: [
        './node_modules/babel-polyfill/dist/polyfill.js',
        './node_modules/whatwg-fetch/fetch.js',
        './node_modules/stompjs/lib/stomp.js'
    ],
    // These files are for your app's JavaScript
    js: [
        './src/js/*.js',
        './src/js/templates/*.js'
    ],
    sw: [
        './src/js/sw/*.js'
    ],
    app: [
        './src/index.html',
        './src/manifest.json'
    ]
};

// Default task: builds your app, starts a server, and recompiles assets when they change
gulp.task('default', ['server'], function () {
    // Watch Sass
    gulp.watch(paths.sass, ['sass']);

    // Watch JavaScript
    gulp.watch(paths.js, ['uglify:app']);

    // Watch JavaScript - Service Workers
    gulp.watch(paths.sw, ['uglify:serviceWorkers']);

    // Watch static files
    gulp.watch(paths.app, ['copy:app']);

    gulp.watch(paths.images.png, ['copy:png']);

    gulp.watch(paths.images.svg, ['copy:svg']);

    // Watch app templates
    // gulp.watch(['./src/templates/**/*.html'], ['copy:templates']);
});

gulp.task('build', function (cb) {
    sequence('clean', ['copy:app', 'copy:png', 'copy:svg', 'sass', 'uglify'], cb);
});

gulp.task('clean', function (cb) {
    rimraf('./build', cb);
});

gulp.task('copy:app', function () {
    return gulp.src(paths.app)
        .pipe(gulp.dest('./build'));
});

gulp.task('copy:png', function () {
    return gulp.src(paths.images.png)
        .pipe(gulp.dest('./build'));
});

gulp.task('copy:svg', function () {
    return gulp.src(paths.images.svg)
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('uglify', ['uglify:libs', 'uglify:app', 'uglify:serviceWorkers']);

gulp.task('uglify:libs', function () {
    return gulp.src(paths.libs)
    // .pipe(concat('lib.js'))
        .pipe(gulp.dest('./build/js/lib/'));
});

gulp.task('uglify:app', function () {
    return gulp.src(paths.js, {base: './src/js'})
    // .pipe(concat('app.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./build/js/'));
});

gulp.task('uglify:serviceWorkers', function () {
    return gulp.src(paths.sw)
        .pipe(concat('service-worker.js'))
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
            browsers: ['last 2 versions']
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
}

// Starts a test server, which you can view at http://localhost:5000
gulp.task('server', ['build'], function () {
    gulp.src('./build')
        .pipe(webserver(webserverSettings))
    ;
});
