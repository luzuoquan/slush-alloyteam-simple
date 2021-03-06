var gulp = require('gulp'),
    gutil = require('gulp-util'),
    install = require('gulp-install'),
    template = require('gulp-template'),
    gulpif = require('gulp-if'),
    rename = require('gulp-rename'),
    path = require('path'),
    url = require('url'),
    inquirer = require('inquirer');

function isUndefined(obj) {
    return obj === void 0;
};

function fixUrl(urlString, prefix, endfix) {
    if (!urlString) return '/';
    endfix = isUndefined(endfix) ? true : endfix;
    prefix = isUndefined(prefix) ? true : prefix;
    if (prefix) {
        urlString = urlString.indexOf('http://') < 0 ? 'http://' + urlString : urlString;
    }
    if (endfix) {
        urlString = urlString[urlString.length - 1] == '/' ? urlString : urlString + '/';
    }
    return urlString;
};

gulp.task('default', function(done) {
    gutil.log('slush-alloyteam-simple');

    var tplFiles = function(file) {
        var basename = path.basename(file.path);
        return (basename === 'project.js') || (basename === 'livefile.js');
    };

    inquirer.prompt([{
            type: 'input',
            name: 'name',
            message: '项目名称 -> '
        }, {
            type: 'input',
            name: 'webServer',
            message: '项目html路径，如: http://find.qq.com/qqun/search/ -> '
        }, {
            type: 'input',
            name: 'cdn',
            message: '项目cdn路径，如: http://s.url.cn/qqun/qqfind/search/ -> '
        }, {
            type: 'input',
            name: 'subModule',
            message: '子项目名字(可直接enter留空)，如: 双十一活动子项目 qiqi_1111 -> '
        }, {
            type: 'confirm',
            name: 'moveon',
            message: '开始初始化项目? -> '
        }],
        function(answers) {
            if (!answers.moveon) {
                return done();
            }

            if (!answers.webServer) {
                gutil.log('html根目录不能为空！');
                return done();
            }

            // set cdn default webserver
            answers.cdn = answers.cdn || answers.webServer;
            answers.subModule = answers.subModule || '';

            // fix url 
            answers.cdn = fixUrl(answers.cdn);
            answers.webServer = fixUrl(answers.webServer);
            answers.subModule = fixUrl(answers.subModule, false, true);

            // alloydist mapping setting suggestion
            var cdnUrlObj = url.parse(answers.cdn);
            var webUrlObj = url.parse(answers.webServer);
            answers.distCdnDir = '/data/sites/cdn.qplus.com' + cdnUrlObj.pathname;
            answers.distHtmlDir = '/data/sites/' + webUrlObj.hostname + webUrlObj.pathname;

            // for livefile.js
            var webServer = (answers.subModule === '/') ? answers.webServer : answers.webServer + answers.subModule;
            var cdn = (answers.subModule === '/') ? answers.cdn : answers.cdn + answers.subModule;
            answers.webServerResolve = webServer.replace('http://', '');
            answers.cdnResolve = cdn.replace('http://', '');

            gulp.src(__dirname + '/templates/**')
                .pipe(gulpif(tplFiles, template(answers)))
                .pipe(rename(function(file) {
                    if (file.basename[0] === '_' && file.basename[1] === '_') {
                        file.basename = '.' + file.basename.slice(2);
                    }
                }))
                .pipe(gulp.dest('./'))
                // .pipe(install())
                .on('finish', function() {
                    done();
                });
        });
});

gulp.task('page', function(done) {
    var pageName = gulp.args[0];
    if (!pageName) {
        console.log('page name require');
        done();
        return;
    }

    var data = {
        pageName: pageName
    };
    gulp.src(__dirname + '/components/page/index.html')
        .pipe(template(data))
        .pipe(rename(function(file) {
            file.basename = file.basename.replace('index', pageName);
        }))
        .pipe(gulp.dest('./src'));

    gulp.src(__dirname + '/components/page/index.js')
        .pipe(rename(function(file) {
            file.basename = file.basename.replace('index', pageName);
        }))
        .pipe(gulp.dest('./src/js/'));

    gulp.src(__dirname + '/components/page/index.scss')
        .pipe(rename(function(file) {
            file.basename = file.basename.replace('index', pageName);
        }))
        .pipe(gulp.dest('./src/css/'));

    gulp.src(__dirname + '/components/page/index.jade')
        .pipe(gulp.dest('./src/tpl/' + pageName + '/'));

    done();
});

gulp.task('autosprite', function(done) {
    var spriteName = gulp.args[0];
    if (!spriteName) {
        console.log('sprite name require');
        done();
        return;
    }

    var data = {
        spriteName: spriteName
    };
    gulp.src(__dirname + '/components/sprite/autosprite.scss')
        .pipe(template(data))
        .pipe(rename(function(file) {
            file.basename = file.basename.replace('autosprite', '_' + spriteName);
        }))
        .pipe(gulp.dest('./src/css/common'));

    gulp.src(__dirname + '/components/sprite/icon.png')
        .pipe(gulp.dest('./src/img/sprite/' + spriteName + '/'));

    done();
});

gulp.task('sprite', function(done) {
    var spriteName = gulp.args[0];
    if (!spriteName) {
        console.log('sprite name require');
        done();
        return;
    }

    var data = {
        spriteName: spriteName
    };
    gulp.src(__dirname + '/components/sprite/sprite.scss')
        .pipe(template(data))
        .pipe(rename(function(file) {
            file.basename = file.basename.replace('sprite', '_' + spriteName);
        }))
        .pipe(gulp.dest('./src/css/common'));

    gulp.src(__dirname + '/components/sprite/icon.png')
        .pipe(gulp.dest('./src/img/sprite/' + spriteName + '/'));

    done();
});

gulp.task('retina', function(done) {
    var spriteName = gulp.args[0];
    if (!spriteName) {
        console.log('sprite name require');
        done();
        return;
    }

    var data = {
        spriteName: spriteName
    };
    gulp.src(__dirname + '/components/sprite/retina.scss')
        .pipe(template(data))
        .pipe(rename(function(file) {
            file.basename = file.basename.replace('retina', '_' + spriteName);
        }))
        .pipe(gulp.dest('./src/css/common'));

    gulp.src(__dirname + '/components/sprite/icon.png')
        .pipe(gulp.dest('./src/img/sprite/' + spriteName + '/'));

    gulp.src(__dirname + '/components/sprite/icon.png')
        .pipe(gulp.dest('./src/img/sprite/' + spriteName + '@2x/'));

    done();
});
