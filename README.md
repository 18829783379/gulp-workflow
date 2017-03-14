## 摘要
- 这个项目可以进行sass编译,es6转es5,压缩js,压缩css,压缩图片,压缩html(这个好像没什么效果),解决js/css缓存问题,启动本地开发Web服务器,我用的是mac,配合charles手机可以进行访问(局域网下直接访问本机ip,注意开放端口/关闭防火墙,我是关闭防火墙没有成功,所以用charles进行代理).

## 安装gulp
- 首先确认已经安装好node, 检查是否安装 node -v 如果能看到版本,表示已经安装成功.
```
# 全局安装Gulp
$ npm install -g gulp
# 在项目中安装Gulp
$ npm install --save-dev gulp
```
- 运行gulp -v,如果不报错，表示安装成功.

## 从此项目构建
- 执行 npm install 安装相关依赖
- gulp test 启动测试环境开发服务
- gulp product 启动生产环境服务,生成生产环境dist文件夹

## 全新构建步骤

### 新建项目目录
- 比如gulp-pro,在命令行中进入到改项目目录,执行
```bash
# 在项目中安装Gulp
$ npm install --save-dev gulp
# 让项目生产package.json文件
$ npm init
```

### 项目目录结构
```
-------------------gulp-workflow
|   |
|   |--------------dist (该文件夹为打包生成的)
|   |   |----------css
|   |   |   |------index-xxxx.css
|   |   |----------js
|   |   |   |------index-xxxx.js
|   |   |----------html
|   |   |   |------home
|   |   |   |   |------index.html
|   |   |   |------index.html
|   |
|   |--------------src
|   |   |----------scss
|   |   |   |------index.scss
|   |   |----------js
|   |   |   |------index.js
|   |   |----------html
|   |   |   |------home
|   |   |   |   |------index.html
|   |   |   |------index.html
|   |
|   |--------------gulpfile.js
|   |--------------package.json
```

### 安装相关插件
```bash
# 安装 Gulp 上 Babel 的插件
$ npm install --save-dev gulp-babel 
# 安装 Gulp 上 uglify 压缩插件
$ npm install --save-dev gulp-uglify 
# 安装 Gulp 上 sass 插件
$ npm install --save-dev gulp-sass 
# 安装 Gulp 上 clean 插件
$ npm install --save-dev gulp-clean 
# 安装 Gulp 上 rev 插件
$ npm install --save-dev gulp-rev 
# 安装 Gulp 上 rev-collector 插件 
$ npm install --save-dev gulp-rev-collector
# 安装 Gulp 上 run-sequence 插件 
$ npm install --save-dev run-sequence
# 安装 Gulp 上 gulp-webserver 插件 
$ npm install --save-dev gulp-webserver
# 安装 Gulp 上 gulp-autoprefixer 插件 
$ npm install --save-dev gulp-autoprefixer
# 安装 Gulp 上 gulp-imagemin 插件 
$ npm install --save-dev gulp-imagemin
# 安装 Gulp 上 imagemin-pngquant 插件 
$ npm install --save-dev imagemin-pngquant
# 安装 Gulp 上 gulp-cache 插件 
$ npm install --save-dev gulp-cache
# 安装 Gulp 上 gulp-htmlmin 插件 
$ npm install --save-dev gulp-htmlmin
# 安装 Gulp 上 gulp-minify-html 插件 
$ npm install --save-dev gulp-minify-html

```

### 创建相关的文件
- 在项目目录下,创建名为'.babelrc'(Babel工具和模块的使用,都必须先写好.babelrc,),该文件用来设置转码规则和插件,内容如下:
```
{
  "presets": ["es2015"]
}
```
- 创建'gulpfile.js'文件

### gulpfile.js 内容如下
```
var gulp = require("gulp");
var babel = require("gulp-babel");// 用于ES6转化ES5
var uglify = require('gulp-uglify');// 用于压缩 JS
var sass = require('gulp-sass'); //scss编译
var rev = require('gulp-rev'); //rev hash码
var reCollector = require('gulp-rev-collector'); //替换html中的js,css文件 刷新缓存
var clean = require('gulp-clean');//清空文件夹里所有的文件
var webserver = require('gulp-webserver');//服务器
var autoprefixer = require('gulp-autoprefixer');//css浏览器内核前缀自动补全
var runSequence = require('run-sequence');//顺序执行
var minImage = require('gulp-imagemin');//图片压缩
var minImageForPng = require('imagemin-pngquant');//图片压缩（png）
var cache = require("gulp-cache");//缓存
var minHtml = require("gulp-htmlmin");//html压缩（js、css压缩）
var minHtmlForJT = require("gulp-minify-html");//html压缩（js模板压缩）
/**
 * 生产环境product
 */
// ES6转化为ES5
// 在命令行使用 gulp toes5 启动此任务
gulp.task("toes5", () => {
    return gulp.src("src/es6js/*.js")// ES6 源码存放的路径
        .pipe(babel())
        .pipe(gulp.dest("src/js")); //转换成 ES5 存放的路径
});
//scss编译
gulp.task('pro-css', () => {
    return gulp.src('src/sass/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'//编译并输出压缩过的文件
        }))
        .pipe(rev())//给css添加哈希值
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest())//给添加哈希值的文件添加到清单中
        .pipe(gulp.dest('rev/css'));
});
//压缩js
gulp.task('pro-js', () => {
    return gulp.src('src/es6js/**/*.js')
        .pipe(babel()) //转换成 ES5 
        .pipe(uglify()) //压缩js
        .pipe(rev()) //给js添加哈希值
        .pipe(gulp.dest('dist/js'))
        .pipe(rev.manifest()) //给添加哈希值的文件添加到清单中
        .pipe(gulp.dest('rev/js'));
});
//将处理过的css，js引入html
gulp.task('reCollector', () => {
    return gulp.src(['rev/**/*.json', 'src/html/**/*.html'])
        .pipe(reCollector({
            replaceReved: true,  //模板中已经被替换的文件是否还能再被替换,默认是false
            dirReplacements: {   //标识目录替换的集合, 因为gulp-rev创建的manifest文件不包含任何目录信息,
                'css/': 'css/',
                'js/': 'js/'
            }
        }))
        .pipe(gulp.dest('dist/html'))
});
//每次打包时先清空原有的文件夹
gulp.task('clean', () => {
    return gulp.src(['dist', 'rev'], {read: false}) //这里设置的dist表示删除dist文件夹及其下所有文件
        .pipe(clean());
});
gulp.task('pro-webServer', function () {
    return gulp.src('dist/')
        .pipe(webserver({
            port: 10889,//端口
            livereload: true,
            // directoryListing: true,
            directoryListing: {
                enable: true,
                path: './dist'
            },
            open: true
        }));
});
// 自动添加前缀
gulp.task('autoFx', function () {
    gulp.src('dist/css/**/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('dist/css'));
});
//压缩图片
gulp.task('minImage', function () {
    return gulp.src('src/images/**/*.{png,jpg,gif,ico}')
        .pipe(cache(minImage({
            progressive: true,
            use: [minImageForPng()]
        })))
        .pipe(gulp.dest('dist/images'));
});
//压缩html
gulp.task('minHtml', function () {
    return gulp.src('src/html/**/*.html')
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
        .pipe(gulp.dest('src/dist'));
});
gulp.task('product', function (callback) {
    runSequence(
        'clean',
        ['pro-js', 'pro-css', 'minImage'],
        'autoFx',
        'reCollector',
        'minHtml',
        'pro-webServer',
        callback);
});
/**
 * 测试环境test
 */
//scss编译
gulp.task('test-css', () => {
    return gulp.src('src/sass/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'//编译并输出压缩过的文件
        }))
        .pipe(gulp.dest('src/css'))
});
//压缩js
gulp.task('test-js', () => {
    return gulp.src('src/es6js/**/*.js')
        .pipe(babel()) //转换成 ES5
        .pipe(uglify()) //压缩js
        .pipe(gulp.dest('src/js'))
});
//创建watch任务去检测html文件,其定义了当html改动之后，去调用一个Gulp的Task
gulp.task('watch', function () {
    gulp.watch(['./src/sass/**/*.scss'], ['test-css']);
    gulp.watch(['./src/es6js/**/*.js'], ['test-js']);
});
gulp.task('test-webServer', function () {
    return gulp.src('src/')
        .pipe(webserver({
            port: 10888,//端口
            livereload: true,
            // directoryListing: true,
            directoryListing: {
                enable: true,
                path: './src'
            },
            open: true
        }));
});
gulp.task('test', function (callback) {
    runSequence(
        ['test-js', 'test-css'],
        'watch',
        'test-webServer',
        callback);
});
```

### task执行命令
```bash
# gulp 任务名称
$ gulp product //生产打包
$ gulp test //测试运行
```

### 说明

- 该文档是gulp入坑的记录,如果错误欢迎留言指正,如有转载,请注明出处,谢谢.


