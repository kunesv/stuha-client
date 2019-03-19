'use strict';

const gulp = require('gulp');

const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const rimraf = require('rimraf');
const uglify = require('gulp-uglify');
const webserver = require('gulp-webserver');
const svgmin = require('gulp-svgmin');
const version = require('gulp-version-number');

const paths = {
    images: {
        svg: ['./src/**/*.svg'],
        png: ['./src/**/*.png']
    },
    // Sass
    sass: [
        './src/**/*.scss'
    ],
    // JavaScript dependencies
    libs: [
        './node_modules/babel-polyfill/dist/polyfill.js',
        './node_modules/whatwg-fetch/fetch.js',
        './node_modules/eventsource-polyfill/dist/eventsource.js'
    ],
    // These files are for your app's JavaScript
    js: [
        './src/**/*.js',
        '!./src/sw/*.js'
    ],
    sw: [
        './src/sw/*.js'
    ],
    app: [
        './src/index.html',
        './src/manifest.json'
    ]
};


// Default task: builds your app, starts a server, and recompiles assets when they change
gulp.task('watcher', function () {
    // Watch Sass
    gulp.watch(paths.sass, gulp.series('sass'));

    // Watch JavaScript
    gulp.watch(paths.js, gulp.series('uglify:app'));

    // Watch JavaScript - Service Workers
    gulp.watch(paths.sw, gulp.series('uglify:serviceWorkers'));

    // Watch static files
    gulp.watch(paths.app, gulp.series('copy:app'));

    gulp.watch(paths.images.png, gulp.series('copy:png'));

    gulp.watch(paths.images.svg, gulp.series('copy:svg'));

    // Watch app templates
    // gulp.watch(['./src/templates/**/*.html'], ['copy:templates']);
});

gulp.task('clean', function (cb) {
    rimraf('./build', cb);
});

gulp.task('copy:app', function () {
    return gulp.src(paths.app)
        .pipe(version({
            'value': '%TS%',
            'append': {
                'key': 'ver',
                'to': ['css', 'js']
            }
        }))
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

gulp.task('uglify:libs', function () {
    return gulp.src(paths.libs)
        .pipe(gulp.dest('./build/js/lib/'));
});

gulp.task('uglify:app', function () {
    return gulp.src(paths.js)
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('uglify:serviceWorkers', function () {
    return gulp.src(paths.sw)
        .pipe(concat('service-worker.js'))
        .pipe(babel({
            presets: ['env']
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
        .pipe(gulp.dest('./build/'))
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
gulp.task('server', function () {
    gulp.src('./build')
        .pipe(webserver(webserverSettings))
    ;
});

gulp.task('uglify', gulp.parallel('uglify:libs', 'uglify:app', 'uglify:serviceWorkers'));
gulp.task('build', gulp.parallel('copy:app', 'copy:png', 'copy:svg', 'sass', 'uglify'));
gulp.task('run', gulp.parallel('server', 'watcher'));
gulp.task('default', gulp.series('clean', 'build', 'run'));