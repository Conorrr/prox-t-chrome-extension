import gulp from 'gulp';
import util from "gulp-util";
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import { stream as wiredep } from 'wiredep';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

const $ = gulpLoadPlugins();

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    '!app/scripts.babel',
    '!app/*.json',
    '!app/*.html',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest('dist'));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format());
  };
}

gulp.task('lint', lint('app/scripts.babel/**/*.js', {
  env: {
    es6: true
  }
}));

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{
        cleanupIDs: false
      }]
    }))
      .on('error', function(err) {
        console.log(err);
        this.end();
      })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('css', () => {
  return gulp.src(['app/styles/*.css'])
    .pipe($.useref({
      searchPath: ['.tmp', 'app', '.']
    }))
    .pipe($.sourcemaps.init())
    .pipe($.if('*.css', $.cleanCss({
      compatibility: '*'
    })))
    .pipe($.sourcemaps.write())
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true
    })))
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('html', () => {
  return gulp.src('app/*.html')
    .pipe($.useref({
      searchPath: ['.tmp', 'app', '.']
    }))
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: false,
      background: {
        target: 'scripts/background.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
    }))
    .pipe($.if('*.css', $.cleanCss({
      compatibility: '*'
    })))
    .pipe($.if('*.js', $.sourcemaps.init()))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.js', $.sourcemaps.write('.')))
    .pipe(gulp.dest('dist'));
});

gulp.task('js', () => {
  return gulp.src([
    'app/scripts/*.js',
    '!app/scripts/background.js',
    '!app/scripts/chromereload.js'])
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('babel', () => {
  var files = ["background.js", "chromereload.js", "firstRun.js", "popup.js"];
  let tasks = files.forEach((file) => {
    browserify({
      entries: ["app/scripts.babel/" + file],
      cache: {},
      packageCache: {},
    }).transform("babelify", {
      presets: ["es2015"]
    })
      .bundle()
      .pipe(source(file))
      .pipe(buffer())
      .pipe($.sourcemaps.init({
        loadMaps: true
      }))
      .pipe($.uglify())
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest('app/scripts'));
  });
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('watch', ['lint', 'babel', 'html'], () => {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload.reload);

  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'babel']);
});

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({
    title: 'build',
    gzip: false
  }));
});

gulp.task('package', function() {
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
    .pipe($.zip('prox t-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
});

gulp.task('build', (cb) => {
  runSequence(
    'lint', 'babel', 'chromeManifest',
    ['html', 'images', 'css', 'extras', 'js'],
    'size', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
