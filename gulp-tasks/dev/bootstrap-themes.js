var path = require('path');

module.exports = function(gulp, plugins, argv) {
    return function() {
        var outputDir = (argv.build || 'build') + '/css/themes';

        return gulp.src('css/themes/*.less')
            .pipe(plugins.less())
            .pipe(plugins.replace('.mw-bs html {', '.mw-bs {'))
            .pipe(plugins.replace('.mw-bs body {', '.mw-bs {'))
            .pipe(gulp.dest(outputDir));
    }
}