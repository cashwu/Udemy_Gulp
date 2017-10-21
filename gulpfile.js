var gulp = require("gulp");
var $ = require('gulp-load-plugins')();
var mainBowerFiles = require('main-bower-files');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var cleanCSS = require('gulp-clean-css');
var parseArgs = require('minimist');
var gulpSequence = require('gulp-sequence')

var envOptions = {
    string: "env",
    default: { env: "develop" }
}

var options = parseArgs(process.argv.slice(2), envOptions);
console.dir(options);

gulp.task('clean', function() {
    return gulp.src(['./.tmp', "./public"], { read: false })
        .pipe($.clean());
});

gulp.task("copyHTML", function() {
    return gulp.src("./source/**/*.html")
        .pipe($.plumber())
        .pipe(gulp.dest("./public/"))
        .pipe(browserSync.stream());
})

gulp.task('jade', function() {
    gulp.src("./source/*.jade")
        .pipe($.plumber())
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest("./public/"))
        .pipe(browserSync.stream());
});

gulp.task('bower', function() {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest("./.tmp/vendors"))
});

gulp.task("vendorJs", ["bower"], function() {
    return gulp.src("./.tmp/vendors/**/**.js")
        .pipe($.concat("vendors.js"))
        .pipe($.if(options.env === "prod", $.uglify()))
        .pipe(gulp.dest("./public/js"))
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
        .pipe($.if(options.env === "prod", cleanCSS()))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream());
});

gulp.task('babel', () =>
    gulp.src('./source/js/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
        presets: ['env']
    }))
    .pipe($.concat('all.js'))
    .pipe($.if(options.env === "prod", $.uglify({
        compress: {
            drop_console: true
        }
    })))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/js'))
    .pipe(browserSync.stream())
);

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
});

gulp.task('watch', function() {
    gulp.watch('./source/scss/**/*.scss', ['sass']);
    gulp.watch('./source/*.jade', ['jade']);
    gulp.watch('./source/js/**/*.js', ['babel'])
});

gulp.task('image-min', () =>
    gulp.src('./source/images/*')
    .pipe($.if(options.env === "prod", $.imagemin()))
    .pipe(gulp.dest('./public/images'))
);

gulp.task('deploy', function() {
    return gulp.src('./public/**/*')
        .pipe($.ghPages());
});

gulp.task('build', gulpSequence("jade", "sass", "babel", "vendorJs", "clean"))

gulp.task("default", ["jade", "sass", "babel", "watch", "vendorJs", "browser-sync", "image-min"]);