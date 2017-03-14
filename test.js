var gulp            = require("gulp"),
    sequence        = require("gulp-sequence"),//顺序执行
    jsHint          = require("gulp-jshint"),//js语法检测
    minImage        = require("gulp-imagemin"),//图片压缩
    minImageForPng  = require("imagemin-pngquant"),//图片压缩（png）
    minCss          = require("gulp-clean-css"),//css压缩
    minJs           = require("gulp-uglify"),//js压缩
    minHtml         = require("gulp-htmlmin"),//html压缩（js、css压缩）
    minHtmlForJT   = require("gulp-minify-html"),//html压缩（js模板压缩）
    rev             = require("gulp-rev"),//MD5版本号
    revCollector    = require("gulp-rev-collector"),//版本替换
    cache           = require("gulp-cache");//缓存

//配置
var config = {
    //资源文件
    source: {
        //源文件
        src: {
            font:   "src/font/*",
            css:    "src/css/*.css",
            ajaxJs: "src/ajaxJs/*.js",
            js:     "src/js/*.js",
            images: "src/images/*.{png,jpg,gif,ico}",
            html:   "src/html/*.html"
        },
        //MD5版本号文件
        rev: {
            font:   "rev/font/*.json",
            css:    "rev/css/*.json",
            ajaxJs: "rev/ajaxJs/*.json",
            js:     "rev/js/*.json"
        },
        //替换版本后的文件
        revCollector: {
            css:    "revCollector/css/*.css",
            html:   "revCollector/html/*.html"
        }
    },
    //目录
    dir: {
        //MD5版本号文件目录
        rev: {
            font:   "rev/font",
            css:    "rev/css",
            ajaxJs: "rev/ajaxJs",
            js:     "rev/js"
        },
        //替换版本后的文件目录
        revCollector: {
            css: "revCollector/css",
            html: "revCollector/html"
        },
        //正式文件目录
        dist: {
            css:    "dist/css",
            ajaxJs: "dist/ajaxJs",
            js:     "dist/js",
            images: "dist/images",
            html:   "dist/html"
        }
    }
};

//任务
var task = {
    jsHint: "jsHint",
    revFont: "revFont",
    revCss: "revCss",
    revAjaxJs: "revAjaxJs",
    revJs: "revJs",
    revCollectorCss: "revCollectorCss",
    revCollectorHtml: "revCollectorHtml",
    minCss: "minCss",
    minAjaxJs: "minAjaxJs",
    minJs: "minJs",
    minHtml: "minHtml",
    minImage: "minImage"
};


//js语法检测
gulp.task(task.jsHint, function () {
    gulp.src([config.source.src.ajaxJs])
        .pipe(jshint())
        .pipe(jshint.reporter());
});

//MD5版本号
gulp.task(task.revFont, function () {
    return gulp.src(config.source.src.font)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.dir.rev.font));
});
gulp.task(task.revCss, function () {
    return gulp.src(config.source.src.css)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.dir.rev.css));
});
gulp.task(task.revAjaxJs, function () {
    return gulp.src(config.source.src.ajaxJs)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.dir.rev.ajaxJs));
});
gulp.task(task.revJs, function () {
    return gulp.src(config.source.src.js)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.dir.rev.js));
});

//版本替换
/**
 *  对插件进行如下修改，使得引用资源文件的url得以如下变换：
 *  "/css/base-f7e3192318.css" >> "/css/base.css?v=f7e3192318"
 *
 *  gulp-rev 1.0.5
 *  node_modules\gulp-rev\index.js
 *  144 manifest[originalFile] = revisionedFile; => manifest[originalFile] = originalFile + '?v=' + file.revHash;
 *
 *  gulp-rev 1.0.5
 *  node_modules\gulp-rev\node_modules\rev-path\index.js
 *  10 return filename + '-' + hash + ext; => return filename + ext;
 *
 *  gulp-rev-collector 7.1.0
 *  node_modules\gulp-rev-collector\index.js
 *  31 if ( !_.isString(json[key]) || path.basename(json[key]).replace(new RegExp( opts.revSuffix ), '' ) !==  path.basename(key) ) { =>
 *  if ( path.basename(json[key]).split('?')[0] !== path.basename(key) ) {
 *
 */
gulp.task(task.revCollectorCss, function () {
    return gulp.src([config.source.rev.font, config.source.src.css])
        .pipe(revCollector())
        .pipe(gulp.dest(config.dir.revCollector.css));
});
gulp.task(task.revCollectorHtml, function () {
    return gulp.src([config.source.rev.css, config.source.rev.ajaxJs, config.source.rev.js, config.source.src.html])
        .pipe(revCollector())
        .pipe(gulp.dest(config.dir.revCollector.html));
});

//压缩文件
gulp.task(task.minCss, function () {
    return gulp.src(config.source.revCollector.css)
        .pipe(minCss())
        .pipe(gulp.dest(config.dir.dist.css));
});
gulp.task(task.minAjaxJs, function () {
    return gulp.src(config.source.src.ajaxJs)
        .pipe(minJs())
        .pipe(gulp.dest(config.dir.dist.ajaxJs));
});
gulp.task(task.minJs, function () {
    return gulp.src(config.source.src.js)
        .pipe(minJs())
        .pipe(gulp.dest(config.dir.dist.js));
});
gulp.task(task.minHtml, function () {
    return gulp.src(config.source.revCollector.html)
        .pipe(minHtmlForJT())//附带压缩页面上的js模板
        .pipe(minHtml({
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            minifyJS: true,
            minifyCSS: true
        }))//附带压缩页面上的css、js
        .pipe(gulp.dest(config.dir.dist.html));
});
gulp.task(task.minImage, function () {
    return gulp.src(config.source.src.images)
        .pipe(cache(minImage({
            progressive: true,
            use: [minImageForPng()]
        })))
        .pipe(gulp.dest(config.dir.dist.images));
});


//正式构建
gulp.task("build", sequence(
    //js语法检测
    //[task.jsHint],
    //MD5版本号
    [task.revFont, task.revCss, task.revAjaxJs, task.revJs],
    //版本替换
    [task.revCollectorCss, task.revCollectorHtml],
    //压缩文件
    [task.minCss, task.minAjaxJs, task.minJs, task.minHtml, task.minImage]
));


gulp.task("default", ["build"], function () {

});