var gulp = require("gulp");
var $ = require('gulp-load-plugins')();
var mainBowerFiles = require('main-bower-files');
var autoprefixer = require('autoprefixer');


gulp.task("copyHTML", function() {
    return gulp.src("./source/**/*.html")
        .pipe($.plumber())
        .pipe(gulp.dest("./public/"))
})

gulp.task('jade', function() {
    gulp.src("./source/*.jade")
        .pipe($.plumber())
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest("./public/"))
});

gulp.task('bower', function() {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest("./.tmp/vendors"))
});

gulp.task('sass', function() {

    var plugins = [
        autoprefixer({ browsers: ['last 2 version', '> 5%', 'ie 8'] })
    ];

    return gulp.src('./source/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass().on('error', $.sass.logError))
        // 編譯完成 css
        .pipe($.postcss(plugins))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('babel', () =>
    gulp.src('./source/js/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
        presets: ['env']
    }))
    .pipe($.concat('all.js'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/js'))
);

gulp.task('watch', function() {
    gulp.watch('./source/scss/**/*.scss', ['sass']);
    gulp.watch('./source/*.jade', ['jade']);
    gulp.watch('./source/js/**/*.jade', ['babel']);
});

gulp.task("default", ["jade", "sass", "babel", "bower", "watch"]);