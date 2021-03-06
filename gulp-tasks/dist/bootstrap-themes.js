var path = require('path');

module.exports = function(gulp, plugins, argv) {
    return function() {
        var outputDir = './dist/css/themes';
        if (argv.cssDir)
            outputDir = path.join(argv.cssDir, '/themes');

        return gulp.src('css/themes/*.less')
            .pipe(plugins.less())
            .pipe(plugins.replace('.mw-bs html {', '.mw-bs {'))
            .pipe(plugins.replace('.mw-bs body {', '.mw-bs {'))
            .pipe(plugins.cleanCss({
                keepSpecialComments: 0,
                processImportFrom: ['!fonts.googleapis.com']
            }))
            .pipe(gulp.dest(outputDir));
    }
}