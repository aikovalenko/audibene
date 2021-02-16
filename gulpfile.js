const { series, parallel, src, dest, watch } = require('gulp')
const rename = require('gulp-rename')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const gulpif = require('gulp-if')
const del = require('del')
const browserSync = require('browser-sync')
const log = require('fancy-log')
const twig = require('gulp-twig')
const data = require('gulp-data')
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const autoprefixer = require('gulp-autoprefixer')
const sass = require('gulp-sass')
sass.compiler = require('node-sass')

const production = process.env.NODE_ENV === 'production'
const server = browserSync.create()

const paths = {
  dist: {
    html: `docs/`,
    js: `docs/js/`,
    css: `docs/css/`
  },
  src: {
    twig: `src/templates/*.twig`,
    data: 'src/data/',
    js: `src/assets/js/**`,
    css: `src/assets/scss/main.scss`
  },
  watch: {
    twig: `src/templates/*.twig`,
    data: 'src/data/*.twig.json',
    js: `src/assets/js/**/*.js`,
    css: `src/assets/scss/**/*.scss`
  },
  clean: `docs/`
}

const fetchData = (cb) => {
  let url = 'https://api.jsonbin.io/b/6023a4c93b303d3d964e8ddf'

  fetch(url, { method: 'Get' })
    .then(res => res.json())
    .then((json) => {
      fs.writeFileSync('src/data/index.twig.json', JSON.stringify(json))
      cb()
    })
}

const serve = (cb) => {
  server.init({
    server: {
      baseDir: paths.clean
    }
  })
  cb()
}

const reload = (cb) => {
  server.reload()
  cb()
}

const clean = () => {
  return del(paths.clean)
}

const styles = () => {
  return src(paths.src.css)
    .pipe(sass({
      includePaths: ['node_modules'],
      outputStyle: production ? 'compressed' : '',
      sourcemap: !production
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rename('styles.css'))
    .pipe(dest(paths.dist.css))
    .pipe(server.stream())
}

const scripts = () => {
  return src(paths.src.js, { sourcemaps: !production })
    .pipe(babel())
    .pipe(gulpif(production, uglify()))
    .pipe(dest(paths.dist.js, { sourcemaps: '.' }))
}

const twigTpl = () => {
  return src(paths.src.twig)
    // Load template pages json data
    .pipe(data(function(file) {
        const products = JSON.parse(fs.readFileSync(paths.src.data + path.basename(file.path) + '.json'))
        return { products: products }
      }).on('error', function(err) {
        process.stderr.write(err.message + '\n')
        this.emit('end')
      })
    )

    .pipe(twig()
      .on('error', function(err) {
        process.stderr.write(err.message + '\n')
        this.emit('end')
      })
    )
    .pipe(dest(paths.dist.html))
}

const watcher = () => {
  watch(paths.watch.css, series(styles))
  watch(paths.watch.js, series(scripts, reload))
  watch([paths.watch.twig, paths.watch.data], series(twigTpl, reload))
}

exports.fetch = fetchData
exports.watch = series(serve, watcher)
exports.build = series(clean, parallel(styles, scripts, twigTpl))
exports.default = series(clean, parallel(styles, scripts, twigTpl))
