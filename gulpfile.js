var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	browerSync = require('browser-sync').create(),
	reload = browerSync.reload;


gulp.task('default', ['serve']);

// gulp.task('task1', function(){
// 	console.log('task1');
// });

// gulp.task('style', function(){
// 	return gulp.src('src/main.scss')
// 	           .pipe(sass({'style': 'expanded'}))
	           
// 	           .pipe(gulp.dest('dist/css'));
// });

// gulp.task('to', function () {
// 	return sass('css/main.scss', {'style': 'expanded'})
// 				.pipe(autoprefixer('last 2 version', 'safari5', 'ie8', 'ie9', 'opera12.1', 'ios6', 'android4'))
// 				.pipe(gulp.dest('dist/css'));
// });

gulp.task('browser-sync', function(){
	browerSync.init({
		server: {
			baseDir: "./"
		}
	});
});

gulp.task('serve', ['sass', 'sass1'],function(){
	browerSync.init({server: "./"});
	gulp.watch("views/index.html").on('change', reload);
	gulp.watch("src/css/*.scss", ['sass']);
	gulp.watch("src/js/widget/paginator/css/*.scss", ['sass1']);
});

gulp.task('sass', function(){
	return sass('src/css/style.scss', {'style': 'expanded'})
				.pipe(gulp.dest('dist/css/'))
				.pipe(reload({stream: true}));
});

gulp.task('sass1', function(){
	return sass('src/js/widget/paginator/css/*.scss', {'style': 'expanded'})
				.pipe(gulp.dest('src/js/widget/paginator/css/paginator.css'))
				.pipe(reload({stream: true}));
});

