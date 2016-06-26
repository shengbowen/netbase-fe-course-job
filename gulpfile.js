var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	rename = require('gulp-rename'),
	imagemin = require('gulp-imagemin'),
	notify = require('gulp-notify'),
	browerSync = require('browser-sync').create(),
	reload = browerSync.reload;




//scss 编译
gulp.task('sass', function(){
	return sass('src/css/style.scss', {'style': 'expanded'})
				.pipe(autoprefixer({
				    browsers: ['last 2 versions', 'Android >= 4.0'],
				    cascade: true, //是否美化属性值 默认：true 像这样：
				    //-webkit-transform: rotate(45deg);
				    //        transform: rotate(45deg);
				    remove:true //是否去掉不必要的前缀 默认：true 
				}))
				.pipe(gulp.dest('dist/css/'))
				.pipe(minifycss())
				.pipe(rename({suffix: '.min'}))
				.pipe(gulp.dest('dist/css/'))
				// .pipe(reload({stream: true}));
});

//分页组件的scss编译
gulp.task('pagescss', function(){
	return sass('src/js/widget/paginator/*.scss', {'style': 'expanded'})
				.pipe(gulp.dest('src/js/widget/paginator/'));
				// .pipe(reload({stream: true}));
});

//reset
gulp.task('reset', function(){
	return gulp.src('src/css/reset.css')
			   .pipe(gulp.dest('dist/css/'))
			   .pipe(minifycss())
			   .pipe(rename({suffix: '.min'}))
			   .pipe(gulp.dest('dist/css/'));
});


gulp.task('scripts', function() {  
  return gulp.src('src/js/*.js')
    .pipe(gulp.dest('dist/js/'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/js/'))
});

//组件
gulp.task('widget',['pagescss'] , function(){
	gulp.src('src/js/widget/**/*.js')
		.pipe(gulp.dest('dist/widget/'))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist/widget/'));

	gulp.src('src/js/widget/**/*.css')
		.pipe(gulp.dest('dist/widget/'))
		.pipe(minifycss())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist/widget/'));
});



gulp.task('images', function() {  
  	gulp.src('img/*.jpg')
    	.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    	.pipe(gulp.dest('dist/img/'));
    gulp.src('img/*.png')
    	.pipe(gulp.dest('dist/img/'));
});


gulp.task('deploy', ['sass', 'reset', 'scripts', 'widget', 'images'], function(){
	notify({ message: 'Images task complete' });
});



gulp.task('browser-sync', function(){
	browerSync.init({
		server: {
			baseDir: "./"
		}
	});
});

gulp.task('serve',function(){
	browerSync.init({server: "./"});
	gulp.watch("views/index.html").on('change', reload);
	gulp.watch("src/css/*.scss", ['sass']);
	gulp.watch("src/js/*.js", ['scripts']);
	gulp.watch("src/js/widget/**/*", ['widget']);
	gulp.watch("img/**", ['images']);
	gulp.watch("src/css/reset.css", ['reset']);
	
	gulp.watch('dist/**').on('change', reload);
});

gulp.task('default', ['serve']);