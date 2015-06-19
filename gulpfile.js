/*global require:true*/
var gulp = require('gulp');
var jsdoc = require("gulp-jsdoc");
var rename = require("gulp-rename");
 
gulp.task('default', function() {
    
    var jsDocsInfos = {
        "plugins": ["plugins/markdown"],
        "tags": {
            "allowUnknownTags" : true
        },
        "markdown": {
            "parser":   "gfm",
            "hardwrap": true
        },
        "opts": {
            "lenient": false
        },
        "private": false,
        "cleverLinks": false,
		"monospaceLinks": true,
        "outputSourceFiles": true
    };
    
    var templateOptions = {
        "path":        "ink-docstrap",
        "systemName":  "Productized CCC Extensions",
        "footer":      "",
		"copyright":   "WebDetails",
		"navType":     "vertical",
		"theme":       "cerulean",
		"linenums":    true,
		"collapseSymbols": true,
		"inverseNav":  true,
        "syntaxTheme": "javascript"
    };
    
    gulp.src(["./exts/**/*.js", "docs/README.md"])
        .pipe(jsdoc.parser(jsDocsInfos))
        .pipe(jsdoc.generator("./dist/docs", templateOptions, jsDocsInfos));
    
    
    // Copy extensions' files
    // from:   exts/<extName>/files
    // to:     dist/docs/examples/exts/<extName>/examples.html
    gulp.src("./*/*.{html,js,css}", {cwd: "./exts/"})
        .pipe(gulp.dest("./dist/docs/examples/exts"));
    
    // Copy lib files to dist
    gulp.src("./lib/**/*.*")
        .pipe(gulp.dest("./dist/docs/examples/lib"));
});