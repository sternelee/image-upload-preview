///////////////////////////////////////////////////////////////////////////////////
//// 图片预览(在img中预览,在canvas中预览)
//// 使用方法
//// canvas预览的情况下,预览后会返回cv图片数据供缩放,移动和旋转
//// 预览后的回掉
//// var previewCallback = function(previewId,cv){
////     if(previewId){
////        // 如果是用canvas来预览
////        // 将loading层隐藏
////        $(".previewloading").hide();
////    }else{
////        //预览失败
////        $(".previewloading").hide();
////    }
//// };
//// //accord传入参数可选,决定了以宽还是高来缩放图片
//// $("#uploadfirst").preview({previewId: "previewimg",callBack:previewCallback,"accord":"width"});
//// 联系人 Even:373384979
//// Copyright (c) 2015 by Sina Corporation. All rights reserved.
///////////////////////////////////////////////////////////////////////////////////
///// <reference path="jquery-1.4.2.js" />
//// 对common.js有依赖
sSina.preview = function () {
    jQuery.fn.extend({
        preview: function (opts) {
            var _self = this, _this = $(this), fileId = _this.selector, fileThis, newFile;
            var settings = jQuery.extend(true, {}, {
                dealSamePicProblem: 1, // 是否需要解决选择同一个文件不能触发onchange的问题1为要解决,0为不需要解决
                previewId: "vL",
                wxWbBtn: ".wxWbBtn", // 微信微博的上传按钮的class(微信中还是采用第三方浏览器的逻辑,因为微信中图片在canvas中存在安全性问题)
                ImgType: ["gif", "jpeg", "jpg", "bmp", "png"],
                callBack: function () { },
                "containerW": 100, // (动态计算出来)以容器的宽还是根据容器的高为准来缩放预览width只以宽为准
                "containerH": 100
            }, opts);

            // 图片onload后调用的方法
            function imgOnloadCallBack(imgData, fileObj, type) {
                var image = new Image();

                // 图片加载成功
                image.onload = function () {
                    // 开始渲染图片,读取图片颠倒信息等
                    $.fn.previewImgCallBack(image, fileObj, settings.previewId, settings.callBack, settings.containerW, settings.containerH);

                    // 解决选择同一图片不触发file onchange的问题
                    if (fileObj && settings.dealSamePicProblem) {
                        newFile.value = '';
                        fileThis.parentNode.replaceChild(newFile, fileThis);

                        // 再次绑定
                        $(fileId).preview({ "dealSamePicProblem": settings.dealSamePicProblem, "previewId": settings.previewId, "callBack": settings.callBack, "containerW": settings.containerW, "containerH": settings.containerH });
                    }

                    if (fileObj && type == "blob") {
                        // 释放
                        _self.resolveObjectURL(imgData);
                    }
                    image = null;
                };

                // 失败
                image.onerror = function () {
                    settings.callBack(null);
                    image = null;
                };
                image.src = imgData;
            }

            // 微信或者微博逻辑
            var appName = (/micromessenger/).test(navigator.userAgent.toLowerCase()) ? "weixin" : ((/weibo/).test(navigator.userAgent.toLowerCase()) ? "weibo" : "other");

            // 通用照片显示
            function showImage(param) {
                var src = null;
                try {
                    // 微博单张图
                    if (param.base64 != null) {
                        src = "data:image/jpeg;base64," + param.base64;
                    }
                    // 微博多张图
                    if (param.resource_ids != null) {
                        imgArr = param.resource_ids;
                    }
                    // 微信单张和多张图
                    if (param.localIds != null) {
                        param.localIds.length <= 1 ? (src = param.localIds) : "";
                    }

                } catch (e) { }

                // 开始走通用的图片显示逻辑
                imgOnloadCallBack(src, null, "weixinweibo");
            }

            // 微信微博选择照片(微信中还是采用第三方浏览器的逻辑,因为微信中图片在canvas中存在安全性问题)
            $(settings.wxWbBtn).gesture({
                ////////////////////////////////
                /// 参数tap有两个值:"tap"和"doubletap",分别表示单击和双击
                ////////////////////////////////
                "tap": function (tap) {
                    if (tap == "tap") {
                        if (appName != "weibo" || !window.wxWbSignFlag) return; // 第三方浏览器或者签名失败就直接返回

                        // 微信微博选择照片(微信中还是采用第三方浏览器的逻辑,因为微信中图片在canvas中存在安全性问题)
                        $.wxWb ? $.wxWb.chooseImage({
                            //                                "wxChooseImage":{
                            ////                                    "count": 1, // 默认9 如果是多个,会形成一个数组,可以通过res.localIds[0],res.localIds[1]...取得每个
                            ////                                    "sizeType": ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
                            ////                                    "sourceType": ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
                            //                                "success": function (res) {
                            //                                    if(res.localIds != null && res.localIds.length >= 1){
                            //                                        showImage(res);
                            //                                    }
                            //                                }
                            //                                },
                            // 微博选择图片参数配置
                            "wbChooseImage": {
                                "source": null,
                                "callBack": function (params, success, code) {
                                    if (params == null || (params.base64 == null && params.resource_ids == null)) {
                                        return;
                                    }
                                    showImage(params);
                                }
                            }
                        }) : "";
                    }
                }, // 快速点击  
                "tapTime": 100 // 传入这个值可以设置是否响应快速点击(单位:毫秒,默认200),越小则表示越快速响应        
            });
            // 第三方浏览器逻辑           
            // 获取file的blob数据(生成的数据链接是独占内存的，因此若不时用时需要调用)
            _self.getObjectURL = function (file) {
                return window.createObjectURL != undefined ? window.createObjectURL(file) : (window[window.webkitURL ? 'webkitURL' : 'URL']['createObjectURL'](file));
            };

            // 在不使用的时候就释放掉
            _self.resolveObjectURL = function (file) {
                window[window.webkitURL ? 'webkitURL' : 'URL']['revokeObjectURL'](file);
            };

            _this.change(function () {
                if (settings.dealSamePicProblem) {
                    // 解决选择同一个文件不能触发onchange的问题,在下边的image.onload中将file的值置空
                    fileThis = this, newFile = fileThis.cloneNode(true);
                }

                if (this.value) {
                    if (!RegExp("\.(" + settings.ImgType.join("|") + ")$", "i").test(this.value.toLowerCase())) {
                        alert("选择文件错误,图片类型必须是" + settings.ImgType.join("，") + "中的一种");
                        this.value = "";
                        return false
                    }

                    function getTarget(event) {
                        return event ? event.target : window.event.srcElement;
                    }

                    // 显示loading层
                    $.s_com.pureCSSLoading($("body"));

                    // 
                    var ua = navigator.userAgent.toLowerCase();
                    try {
                        var url = _self.getObjectURL(this.files[0]);
                        // 统一用objectURL的方式来读取
                        if (url && ua.indexOf("iphone") == -1) {
                            var file = this.files[0];
                            // 读取图片
                            imgOnloadCallBack(url, file, "blob");
                        } else if (this.files && this.files[0] && ua.indexOf("iphone") > -1) {
                            // ios单独处理
                            var file = this.files[0];

                            var reader = new FileReader();
                            reader.onload = function (event) {
                                var evt = event ? event : window.event;
                                var targetE = getTarget(evt);
                                // 读取图片
                                imgOnloadCallBack(targetE.result, file);
                            }
                            reader.readAsDataURL(this.files[0]);
                        } else {
                            $.s_com.sendMonitor('send', 'event', 'button', 'uploadunsupport_nosecurity', 'uploadunsupport_nosecurity', 1, 'other_uploadunsupport_nosecurity:1');
                            alert("您的手机不支持,请换个现代浏览器参与活动");
                            settings.callBack(null);
                        }
                    } catch (e) {
                        $.s_com.sendMonitor('send', 'event', 'button', 'uploadunsupport_nosecurity', 'uploadunsupport_nosecurity', 1, 'other_uploadunsupport_nosecurity:1');
                        alert("您的手机不支持,请换个现代浏览器参与活动");
                        settings.callBack(null);
                    }
                }
            });
        },
        // 图片本地预览后调用的方法
        previewImgCallBack: function (imgThis, file, previewId, callBack, containerW, containerH) {
            var Orientation, accord, mpImg;
            try {
                if (!file) {
                    // 微信微博中渲染
                    mpImg = new MegaPixImage(imgThis);
                    Orientation = 1;
                    startRender();
                } else {
                    // (向后兼容)第三方浏览器
                    // 读取图片方向信息
                    __EXIF.getData(imgThis, function () {
                        // 获取图片颠倒信息以便修正 
                        Orientation = __EXIF.getTag(imgThis, "Orientation");
                        if (Orientation == undefined) {
                            Orientation = 1;
                        }

                        mpImg = new MegaPixImage(file);

                        startRender();

                        // 销毁file对象
                        file = null;
                    });
                }
            } catch (e) {
                callBack(null);
            }
            function startRender() {
                // 根据是用img渲染还是用canvas渲染
                var nodeType = $("#" + previewId)[0].tagName.toLowerCase();
                switch (nodeType) {
                    case "img":
                        // 对于图片预览的情况MegaPixImage会将图片用canvas纠正后在放入canvas中.所以在执行自己的callback的时候没有等待图片的onload之后就执行了导致不能在callback中正确获取图的宽高
                        // 遂做这样的处理
                        var imgObj = $.s_com.getId(previewId);
                        imgObj.onload = function () {
                            accord = imgObj.width / imgObj.height < containerW / containerH ? "width" : "height";
                            // 将图片数据放入预览的容器             
                            $.fn.commonDraw({ "nodeType": "img", "datapich": $("#" + previewId).height(), "datapicw": $("#" + previewId).width(), "previewId": previewId, "accord": accord, "callBack": callBack });
                            imgObj = null;
                        };
                        imgObj.onerror = function () {
                            callBack(null);
                            imgObj = null;
                        };
                        // 用img预览
                        // 解决IOS图片过大问题要设置maxwidth和maxheight
                        mpImg.render(imgObj, { maxWidth: 1000, maxHeight: 1000, orientation: Orientation }, function () { });
                        break;
                    case "canvas":
                        // canvas预览                        
                        var cv = document.createElement('canvas');

                        // 先移除之前存在的
                        $("#container_" + previewId).remove();
                        $("body").append('<div id="container_' + previewId + '" style="display:none"></div>');
                        $("#container_" + previewId).append(cv);

                        // 赋予临时canvas以id
                        $("canvas", $("#container_" + previewId)).attr("id", "tempcv_" + previewId);

                        // 清除用户的操作画布
                        var preCV = document.getElementById(previewId);
                        var preCV2D = preCV.getContext("2d");

                        // 清除画布
                        preCV2D.clearRect(0, 0, preCV.width, preCV.height);

                        // 解决IOS图片过大问题要设置maxwidth和maxheight
                        mpImg.render(document.getElementById("tempcv_" + previewId), { maxWidth: 1000, maxHeight: 1000, orientation: Orientation }, function () {
                            // 自动算出accord的值
                            accord = cv.width / cv.height < containerW / containerH ? "width" : "height";
                            // 将临时canvas中的图片放入要预览的canvas容器
                            $.fn.commonDraw({ "nodeType": "canvas", "datapich": cv.height, "datapicw": cv.width, "previewId": previewId, "accord": accord, "cv": cv, "callBack": callBack });
                        });
                        break;
                }
            }
        },
        // 将临时canvas中的图片放入预览canvas的方法,ios和android公用
        commonDraw: function (param) {
            var previewH, previewW;
            var oriH = parseInt(param.datapich),
                oriW = parseInt(param.datapicw);
            var $previewDom = $("#" + param.previewId);
            switch (param.nodeType) {
                case "img":
                    // 以宽还是高为标准来预览图片                
                    if (param.accord == "height") {
                        previewH = $previewDom.parent().height();
                        previewW = oriW * previewH / oriH;
                    } else {
                        previewW = $previewDom.parent().width();
                        previewH = oriH * previewW / oriW;
                    }

                    // 图片显示后的方法
                    // 在这里做默认显示高度宽度处理
                    $previewDom.css({ "width": previewW + "px", "height": previewH + "px" });

                    // 预览成功
                    $previewDom.css({ "left": "0px", "top": "0px" });

                    param.callBack(param.previewId);
                    break;
                case "canvas":
                    // 将临时画布中的放入最终canvas,等比缩小
                    var cvFinal = document.getElementById(param.previewId);
                    var cvFinal2D = cvFinal.getContext("2d");

                    // 以高为标准还是以宽为标准来缩放预览图片
                    if (param.accord == "height") {
                        previewH = $previewDom.parent().height();
                        previewW = oriW * previewH / oriH;
                    } else {
                        previewW = $previewDom.parent().width();
                        previewH = oriH * previewW / oriW;
                    }

                    // 将图片的初始尺寸保存在canvas上
                    $previewDom.attr("datapicw", previewW);
                    $previewDom.attr("datapich", previewH);

                    // 初始化图片在canvas中的x,y
                    $previewDom.attr("datapicx", 0);
                    $previewDom.attr("datapicy", 0);

                    $previewDom.attr("datacenterw", previewW);
                    $previewDom.attr("datacenterh", previewH);

                    cvFinal2D.drawImage(param.cv, 0, 0, oriW, oriH, 0, 0, previewW, previewH);

                    // 移除临时的cv
                    $("canvas", $("#container_" + param.previewId)).remove();
                    $("#container_" + param.previewId).remove();

                    // 将临时cv传过去供后续调用
                    param.callBack(param.previewId, {
                        "cvData": param.cv,
                        "width": oriW,
                        "height": oriH
                    });

                    param.cv = null;
                    break;
            }

            // 将缩放的依据(以宽还是以高为标准来缩放)
            $previewDom.attr("accord", param.accord);
        }
    });
};