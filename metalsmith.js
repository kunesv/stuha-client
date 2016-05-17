var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var dateFormatter = require('metalsmith-date-formatter');
var layouts = require('metalsmith-layouts');
var sass = require('metalsmith-sass');
var serve = require('metalsmith-serve');
var watch = require('metalsmith-watch');


Metalsmith(__dirname)
    .use(collections({
        articles: {
            pattern: 'articles/**/*.*',
            sortBy: 'date',
            reverse: true
        }
    }))
    .use(markdown())
    .use(permalinks(
        {
            pattern: ':title',
            relative: false
        }
    ))
    .use(dateFormatter({
        dates: [{
            key: 'date',
            format: 'MMM Do YYYY'
        }]
    }))
    .use(layouts({
        engine: 'handlebars',
        directory: 'src/layouts'
    }))
    .use(sass({
        outputDir: 'css/'
    }))
    .use(serve({
        host: '0.0.0.0',
        port: process.env.PORT || 5000
    }))
    .use(watch())
    .build(function (err) {
        if (err) throw err;
    });


