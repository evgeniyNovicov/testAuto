const { src, dest, watch, parallel, series}  = require('gulp');
let gulp = require('gulp')
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin');
const del = require('del');                                                                         
const pug = require('gulp-pug');
const dataset = require('gulp-data');
const fs = require('fs');
// const dataFromFile = JSON.parse(JSON.stringify(fs.readFileSync('./setdata.json')))

function setPug () {
    return src ('app/index.pug')
        .pipe(dataset(function(){
            return JSON.parse(fs.readFileSync('./setdata.json'))
        }))
        .pipe(pug({
            pretty: true,
            // locals: dataFromFile || {},
        }))
        .pipe(dest('app'))
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app"
        }
    });
}

function cleanDist (){
    return del ('dist')
}

function images(){
    return src(['app/images/**/*'])
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest('dist/images'))
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js',
    ])
        .pipe(concat('main.min.js'))
        // .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());
}

function styles() {
    return src('app/scss/style.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/js/main.min.js',
        'app/fonts/**/*',
        'app/*.html'
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function watching() {
    watch(['app/scss/**/*.scss'], styles)
    watch(['app/js/main.js', '!app/js/main/min.js'], scripts)
    watch(['app/*.pug'], parallel('setPug'))
    watch(['app/*.html']).on('change', browserSync.reload)
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.setPug = setPug; 

exports.build = series( cleanDist, images, build);
exports.default = parallel(styles, setPug, scripts, browsersync, watching );