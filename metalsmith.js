var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var dateFormatter = require('metalsmith-date-formatter');
var layouts = require('metalsmith-layouts');
var serve = require('metalsmith-serve');

Metalsmith(__dirname)
    .use(collections({
        "articles": {
            "pattern": "articles/**/*.*",
            "sortBy": "date",
            "reverse": true
        }
    }))
    .use(markdown())
    .use(permalinks(
        {
            "pattern": ":title",
            "relative": false
        }
    ))
    .use(dateFormatter({
        "dates": [{
            "key": "date",
            "format": "MMM Do YYYY"
        }]
    }))
    .use(layouts({
        "engine": "handlebars",
        "directory": "src/layouts"
    }))
    .use(serve({
        "port": process.env.PORT || 5000
    }))
    .build(function (err) {
        if (err) throw err;
    });


