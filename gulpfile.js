// gulpfile.js

const handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const gulp  = require('gulp');
const fs = require('fs');

const dataVisConfig = require('./dataVis.json');

gulp.task('default', function() {
    return gulp.src('./src/templates/*.hbs')
        .pipe(handlebars(dataVisConfig, {
            ignorePartials: false,
            batch: ['./src/templates/partials'],
            helpers: {
                visualizationTitle: function(audiences) {
                    return (dataVisConfig.title)

                }
            }
        }))
        .pipe(rename({
            extname: '.html'
        }))
        .pipe(gulp.dest('./build'));
});

