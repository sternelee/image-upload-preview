///////////////////////////////////////////////////////////////////////////////////
//// 移动端图片裁剪合成
//// File: sina.cutcompose.js
//// Defines: $.cutCompose.cut({})裁剪
//// Defines: $.cutCompose.mege({})合成
//// Description: 图片本地合成：implements the sSina jQuery extension method
////
//// 使用方法:$.cutCompose.cut({})裁剪
//// 使用方法:$.cutCompose.mege({})合成
//// Copyright (c) 2013 by Sina Corporation. All rights reserved.
//// 联系人 Even:373384979
///////////////////////////////////////////////////////////////////////////////////
///// <reference path="jquery-1.4.2.js" />
sSina.cutcompose = function () {
    (function ($) {
        var defaults = {
            infoOpt: {
                "modeW": 0,
                "modeH": 0,
                "left": 0,
                "top": 0,
                "source": ""// 图片id或者canvas的id
            },
            curOpt: {
                "source": "", // 图片id或者canvas的id
                "left": 0, // 从图片的哪一点X值开始裁剪
                "top": 0, // 从图片的哪一点Y值开始裁剪
                "width": 200, // 裁剪多少宽度
                "height": 300, // 裁剪多少高度
                "callBack": function () { }, // 返回裁剪之后的img数据
                "ratio": 1 //图片压缩比率1表示不压缩
            },
            mergeOpt: {
                "source": "", // 传入裁剪后的图片数据
                "modesource": "", // 图片绝对路径
                "offSetLeft": 0, // 模板左边框的宽度
                "offSetTop": 0, // 从模板图片的哪一点Y值开始贴图合成
                "callBack": function () { }, // 模板左边框的高度
                "ratio": 1 //图片压缩比率1表示不压缩
            }
        };
        var cutCompose =
        {
//            info: function (options) {
//                // 获取裁剪需要的字段信息
//                var settings = $.extend(true, {}, defaults.infoOpt, options), infoJson = {
//                    "left": 0, // 从图片的哪一点X值开始裁剪
//                    "top": 0, // 从图片的哪一点Y值开始裁剪
//                    "width": 0, // 裁剪多少宽度
//                    "height": 0// 裁剪多少高度
//                };
//                // 来源可能是canvas和页面图片,一样的处理
//                var $source = $("#" + settings.source), $$source = $.s_com.getId(settings.source);

//                if (!$$source) {
//                    // 如果没有传入id,直接返回
//                    return;
//                }
//                var modeW = settings.modeW, modeH = settings.modeH;
//                var tagName = $source[0].tagName.toLowerCase(), x, y, picW, picH, blankW = modeW, blankH = modeH;

//                switch (tagName) {
//                    case "img":
//                        x = parseInt(settings.left);
//                        y = parseInt(settings.top);
//                        picW = $source.width();
//                        picH = $source.height(); ;
//                        break;
//                    case "canvas":
//                        // 图片在canvas中的x,y坐标以及高度和宽度,以属性的方式保存在canvas中
//                        x = parseInt($source.attr("datapicx"));
//                        y = parseInt($source.attr("datapicy"));
//                        picW = $source.attr("datapicw");
//                        picH = $source.attr("datapich"); ;
//                        break;
//                }

//                // 如果图片的位移x坐标大于0
//                if (x >= 0) {
//                    // 需要裁剪的宽度
//                    infoJson.width = (blankW - x) > picW ? picW : (blankW - x);
//                    // 裁剪的时候从哪个x坐标开始
//                    infoJson.left = tagName == "img" ? 0 : x;
//                } else {
//                    // 需要裁剪的宽度
//                    infoJson.width = (picW - Math.abs(x)) > blankW ? blankW : (picW - Math.abs(x));
//                    // 裁剪的时候从哪个x坐标开始
//                    infoJson.left = tagName == "img" ? Math.abs(x) : 0;
//                }
//                // 鉴于drawimage不能画0,0的区域,所以要判断做异常处理预防
//                infoJson.width = infoJson.width <= 0 ? 1 : infoJson.width;
//                //infoJson.left = Math.abs(infoJson.left) > picW ? (picW-1) : infoJson.left;

//                if (y >= 0) {
//                    // 需要裁剪的高度
//                    infoJson.height = (blankH - y) > picH ? picH : (blankH - y);
//                    // 裁剪的时候从哪个y坐标开始
//                    infoJson.top = tagName == "img" ? 0 : y;
//                } else {
//                    // 需要裁剪的高度
//                    infoJson.height = (picH - Math.abs(y)) > blankH ? blankH : (picH - Math.abs(y));
//                    // 裁剪的时候从哪个y坐标开始
//                    infoJson.top = tagName == "img" ? Math.abs(y) : 0;
//                }
//                // 鉴于drawimage不能画0,0的区域,所以要判断做异常处理预防
//                infoJson.height = infoJson.height <= 0 ? 1 : infoJson.height;
//                //infoJson.top = Math.abs(infoJson.top) > picH ? (picH-1) : infoJson.top;


//                return infoJson;
//            },
            //裁剪options参数 {
            //    "source":"",// 图片绝对路径(含http)或者图片id
            //    "left":0,// 从图片的哪一点X值开始裁剪
            //    "top":0,// 从图片的哪一点Y值开始裁剪
            //    "width":200,// 裁剪多少宽度
            //    "height":300,// 裁剪多少高度
            //    "callBack":function(base64str){在这里获取裁剪后的图片数据},回调
            //}
            cut: function (options) {
                var settings = $.extend(true, {}, defaults.curOpt, options), base64str;
                // 来源可能是canvas和页面图片,一样的处理
                var $source = $("#" + settings.source), $$source = $.s_com.getId(settings.source);

//                // 获取裁剪需要的参数
//                var infoJson = $.cutCompose.info({
//                    "modeW": settings.width,
//                    "modeH": settings.height,
//                    "left": settings.left,
//                    "top": settings.top,
//                    "source": settings.source// 图片id或者canvas的id
//                });

                settings.width = settings.width;//infoJson.width;
                settings.height = settings.height;//infoJson.height;
                settings.left = settings.left;//infoJson.left;
                settings.top = settings.top;//infoJson.top;

                if (!$$source) {
                    // 如果没有传入id,直接返回
                    return;
                }

                var tagName = $source[0].tagName.toLowerCase(), base64;

                switch (tagName) {
                    case "img":
                        // 需要重新装载图片,因为页面上的图片可能被缩放过了,重新装载
                        var image = new Image();
                        image.onload = function () {
                            var imgW = image.width, imgH = image.height;
                            // 先把用户处理后的整个图片放入临时canvas
                            // 再用canvas对canvas的形式裁剪
                            base64 = renderInCanvas({
                                "source": image,
                                "sx": 0,
                                "sy": 0,
                                "sw": imgW,
                                "sh": imgH,
                                "dx": 0,
                                "dy": 0,
                                "dw": $source.width(),
                                "dh": $source.height()
                            }, settings);

                            // 将裁剪后的图片放入callback返回
                            if (settings.callBack) {
                                settings.callBack(base64);
                            }
                            image = null;
                        };
                        image.onerror = function () {
                            // 将裁剪后的图片放入callback返回
                            if (settings.callBack) {
                                settings.callBack(null);
                            }
                            image = null;
                        };
                        image.src = $source.attr("src");
                        break;
                    case "canvas":
                        // 获取base64数据
                        base64 = renderInCanvas({
                            "source": $$source,
                            "sx": settings.left,
                            "sy": settings.top,
                            "sw": settings.width,
                            "sh": settings.height,
                            "dx": 0,
                            "dy": 0,
                            "dw": settings.width,
                            "dh": settings.height
                        });
                        // 将裁剪后的图片放入callback返回
                        if (settings.callBack) {
                            settings.callBack(base64);
                        }
                        break;
                }

                // canvas
                function renderInCanvas(param, opt) {
                    var cv = document.createElement('canvas');
                    var cv2D = cv.getContext('2d');

                    cv.width = param.sw;
                    cv.height = param.sh;

                    if (!cv2D) {
                        alert("你的浏览器不支持html5");
                        return;
                    }
                    // 清除被覆盖的背景以减少图片尺寸
                    cv2D.clearRect(0, 0, cv.width, cv.height);
                    // 开始重新绘制图片到canvas
                    cv2D.drawImage(param.source, param.sx, param.sy, param.sw, param.sh, param.dx, param.dy, param.dw, param.dh);

                    if (opt) {
                        // 如果source是图片
                        var cvFinal = document.createElement('canvas');
                        var cvFinal2D = cvFinal.getContext('2d');

                        cvFinal.width = opt.width;
                        cvFinal.height = opt.height;

                        // 清除被覆盖的背景以减少图片尺寸
                        cvFinal2D.clearRect(0, 0, cvFinal.width, cvFinal.height);

                        // 把图片裁剪
                        cvFinal2D.drawImage(cv, opt.left, opt.top, opt.width, opt.height, 0, 0, opt.width, opt.height);
                        //base64Str = cvFinal.toDataURL("image/jpeg", opt.ratio);
                        base64Str = $.cutCompose.imgEncoder(cvFinal, cvFinal2D, settings.ratio);

                        cv = null, cvFinal = null;

                        return base64Str;
                    }

                    // 如果source是canvas,直接裁剪好了
                    //base64Str = cv.toDataURL("image/jpeg", settings.ratio);
                    base64Str = $.cutCompose.imgEncoder(cv, cv2D, settings.ratio);

                    cv = null;

                    return base64Str;
                }
            },
            imgEncoder: function (cv, cv2d, ratio) {
                var imageData = cv2d.getImageData(0, 0, cv.width, cv.height);
                var data = imageData.data;

                var encoder = new JPEGEncoder();
                var base64Str = encoder.encode({
                    width: cv.width,
                    height: cv.height,
                    data: data
                }, ratio);

                return base64Str;
            },
            merge: function (options) {
                // 合成
                var settings = $.extend(true, {}, defaults.mergeOpt, options), base64str;

                if (!settings.modesource) {
                    // 如果没有传入模板地址,直接返回
                    return;
                }

                // 模板图片地址
                if (settings.modesource.indexOf("/") > -1) {
                    var image = new Image();

                    image.onload = function (e) {

                        renderInCanvas({
                            "source": image,
                            "sx": 0,
                            "sy": 0,
                            "sw": image.width,
                            "sh": image.height,
                            "dx": 0,
                            "dy": 0,
                            "dw": image.width,
                            "dh": image.height
                        }, settings);
                    };

                    image.onerror = function (e) {

                        if (settings.callBack) {
                            settings.callBack(null);
                        }
                        image = null;
                    };
                    image.src = settings.modesource;
                } else {
                    // 模板地址不存在
                    alert("没有配置模板");
                }

                function renderInCanvas(param, opt) {
                    var cv = document.createElement('canvas');
                    var cv2D = cv.getContext('2d'), base64str;

                    cv.width = param.sw;
                    cv.height = param.sh;

                    if (!cv2D) {
                        alert("你的浏览器不支持html5");
                        return;
                    }


                    // 开始绘制裁剪的图片到canvas
                    var img = new Image();
                    img.onload = function (e) {
                        // 清除被覆盖的背景以减少图片尺寸
                        cv2D.clearRect(0, 0, cv.width, cv.height);
                        // 开始绘制裁剪的图片到canvas
                        cv2D.drawImage(img, 0, 0, img.width, img.height, opt.offSetLeft, opt.offSetTop, opt.width, opt.height);

                        // 开始绘制模板图片到canvas
                        cv2D.drawImage(param.source, param.sx, param.sy, param.sw, param.sh, param.dx, param.dy, param.dw, param.dh);

                        // 绘制完成后转化为数据供上传                  
                        //base64str = cv.toDataURL("image/jpeg", opt.ratio);
                        base64str = $.cutCompose.imgEncoder(cv, cv2D, settings.ratio);
                        cv = null;
                        if (opt.callBack) {
                            opt.callBack(base64str);
                        }
                        img = null;
                        param.image = null;
                    };

                    img.onerror = function (e) {
                        if (opt.callBack) {
                            opt.callBack(null);
                        }
                        img = null;
                    };
                    img.src = opt.source;
                }
            }
        };
        $.extend({ cutCompose: cutCompose });
    })(jQuery);
};
