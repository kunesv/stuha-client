var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var layouts = require('metalsmith-layouts');
var sass = require('metalsmith-sass');
var serve = require('metalsmith-serve');
var watch = require('metalsmith-watch');
var babel = require('metalsmith-babel');

Metalsmith(__dirname)
    .use(permalinks(
        {
            pattern: ':path',
            relative: false
        }
    ))
    .use(babel({
        presets: ['es2015']
    }))
    .use(layouts({
        engine: 'mustache',
        directory: 'src/layouts'
    }))
    .use(sass({
        outputDir: 'css/'
    }))
    .use(serve({
        host: '0.0.0.0',
        port: process.env.PORT || 5000
    }))
    .use(watch({
        paths: {
            "${source}/**/*": true, // every changed files will trigger a rebuild of themselves
            "${source}/layouts/**/*": "**/*" // every templates changed will trigger a rebuild of all files
        }
    }))
    .build(function (err) {
        if (err) throw err;
    });


// '${source}/../node_modules/babel-polyfill/dist/polyfill.js'