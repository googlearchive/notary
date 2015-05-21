# Notary
> Keep your files licensed

Notary is a small gulp plugin and command line tool that prepends a license header onto files that don't already have one.

When used as a command line tool, it will process all files in your current working directory (except for files in `node_modules` and `bower_components` folders).

When used as a gulp plugin, `notary` will prepend the given header text to all `src`'d files.

The only requirement is that the header text contain a line starting with `@license`.

## Gulp Usage

Install:
```
npm install notary
```

Usage:
```javascript
var gulp = require('gulp');
var notary = require('notary');

gulp.task('license', function() {
  return gulp.src('**/*.{js,css,html}')
  .pipe(notary{
    header: '@license\nCC0 Public Domain'
  })
  .pipe(gulp.dest('dist'))
;
})
```

## Command Line tool

Install:
```
npm install -g notary
```

Usage:

> When used as a cli tool, notary expects a file containing the header text as the only argument

```
cd my-project-folder
notary ../header-file.txt
```
