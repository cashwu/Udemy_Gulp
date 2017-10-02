var gulp = require("gulp");
var jade = require('gulp-jade');

gulp.task("copyHTML", function(){
    return gulp.src("./source/**/*.html")
        .pipe(gulp.dest("./public/"))
})

gulp.task('jade', function() {
   
    gulp.src("./source/*.jade")
      .pipe(jade({
        pretty:true
      }))
      .pipe(gulp.dest("./public/"))
});