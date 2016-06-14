var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer');


gulp.task('default', function(){
	console.log('hello gulp!');
});

gulp.task('task1', function(){
	console.log('task1');
});

gulp.task('style', function(){
	return gulp.src('src/main.scss')
	           .pipe(sass({'style': 'expanded'}))
	           
	           .pipe(gulp.dest('dist/css'));
});

gulp.task('to', function () {
	return sass('css/main.scss', {'style': 'expanded'})
				.pipe(autoprefixer('last 2 version', 'safari5', 'ie8', 'ie9', 'opera12.1', 'ios6', 'android4'))
				.pipe(gulp.dest('dist/css'));
})