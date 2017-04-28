///////////////////////////////////////////////////////////////////////////////////
//// 移动端元素(图片)移动,缩放,旋转
//// File: sina.movescalerotate.js,支持移动,缩放,旋转img和canvas中的图片
//// Defines: $("#previewimg").moveScaleRotate({"moveAble":"upload","temCV":cv})
//// Description: 移动元素,缩放,旋转：implements the sSina jQuery extension method
////
//// 在img中预览使用方法:$("#previewimg").moveScaleRotate({"moveAble":"upload"})
//// 在canvas中预览使用方法:$("#previewimg").moveScaleRotate({"moveAble":"upload","temCV":cv}),cv代表预览返回的图片数据
//// 配置moveAble可以增大操控区域
//// Copyright (c) 2013 by Sina Corporation. All rights reserved.
//// 联系人 Even:373384979
///////////////////////////////////////////////////////////////////////////////////
///// <reference path="jquery-1.4.2.js" />
//// 对common.js有依赖
sSina.movescalerotate = function () {
    (function ($) {
        var defaults = {
            temCV: null,
            moveAble: null// 如果存在这个id表示:用户可以在图片外的父级元素进行移动操作
        };
        // 图片右上角的点到canvas0,0的坐标
        var actionType, picX = 0, picY = 0,
            picW, picH, // 缩放后的宽高
            cvTemp,
            accord, // 根据宽来缩放还是根据高来缩放
            cvTempH, cvTempW, // 图片预览的最原始的宽高
            cvFinal, cvFinalH, cvFinalW, rotateV = 0, animating = false;

        // 公用控制缩放的宽和高函数
        function getWH(param) {
            var ajust;
            // 以高/宽为基准来缩放

            ajust = param.ratio >= 1 ? (param.picValue + param.ratio * 10) : (param.picValue - param.ratio * 10);
            // 最大最小控制
            param.min = ajust < param.min ? param.min : ajust;
            param.min = ajust > param.max ? max : param.min;

            return param.min;
        }

        // 手势行为
        $.fn.moveScaleRotate = function (options) {
            var settings = $.extend(true, {}, defaults, options), previewId = $(this).selector.replace("#", ""); // 从外部读取配置覆盖本程序配置
            var $cv = $("#" + previewId), orgLeft, orgTop, newLeft = 0, newTop, lastRatio = 1, zoomTimeout, moveTimeout;

            // 获取预览容器的类型
            var nodeType = $cv[0].tagName.toLowerCase();

            // 预览容器是img的情况,需要用定位的属性
            if (nodeType == "img") {
                $cv.css({ "left": "0px", "top": "0px", "position": "absolute" });
            } else {
                $cv.attr({ "rotateV": 0, "datacenterx": 0, "datacentery": 0 });

                // 临时画布(优化的时候发现只要初次赋值就可以了,性能会好一点)
                cvTemp = settings.temCV.cvData;
                cvTempW = settings.temCV.width;
                cvTempH = settings.temCV.height;

                cvFinal = $.s_com.getId(previewId);
                cvFinalW = cvFinal.width;
                cvFinalH = cvFinal.height;
            }

            accord = $cv.attr("accord");

            // 公用的记录相关值
            function recodeValue(type) {
                switch (type) {
                    case "tap":
                        break;
                    case "move":
                        picX += newLeft;
                        picY += newTop;

                        // 将图片左上角距离canvas的x,y的坐标作为属性存起来
                        // 最后一次移动后保存其坐标点供缩放和旋转使用
                        // 移动后保存移动的时候的宽和高
                        $cv.attr({
                            "datapicx": picX,
                            "datapicy": picY,
                            "datacenterx": picX,
                            "datacentery": picY,
                            "datacenterw": picW,
                            "datacenterh": picH
                        });
                        break;
                    case "zoom":
                    case "rotation":
                        // 缩放后也要更新该值,用于下一次中心点的计算
                        // 缩放完后将图片的宽高存起来
                        $cvId.attr({
                            "datacenterx": $cvId.attr("datapicx"),
                            "datacentery": $cvId.attr("datapicy"),
                            "datacenterw": $cvId.attr("datapicw"),
                            "datacenterh": $cvId.attr("datapich")
                        });
                        break;
                }
            }

            // 清除帧频流畅处理
            function cancelFrame() {
                window.cancelAnimationFrame(moveTimeout);
                window.cancelAnimationFrame(zoomTimeout);
            }

            // 旋转和移动的公用事件
            function rotateMove(e, atype, rotataType, p1, p2) {
                $.s_com.preventDefault(e);

                // 周四这里还有问题,一直手指上去移动后,另一只上来缩放/旋转操作会偏移
                // 对于开始是一个手指,再后来触摸一支手指的情况,需要记录相关值
                if (actionType == "move") {
                    recodeValue("move");
                }

                cancelFrame();

                // 两点连成的直线竖直的时候从-80度(旧点)旋转到80度(新点)(80-(-80)=160)
                actionType = atype;

                switch (atype) {
                    case "rotation":
                        // 左右旋
                        zoomTimeout = window.requestAnimationFrame(function () {
                            $.fn.zoomOutOrIn({ "cvId": $cv, "temCv": cvTemp, "cV": cvFinal, ratio: lastRatio, "type": rotataType });
                            animating = false;
                        });
                        break;
                    case "zoom":
                        // 缩放
                        /// 缩放原理：
                        /// 手指放上去的时候的距离 > 双指移动后的距离便是缩小
                        /// 手指放上去的时候的距离 < 双指移动后的距离便是放大
                        // 控制最大缩放比防止操作区域太小
                        lastRatio = p2.zValue / p1.zValue > 2 ? 2 : p2.zValue / p1.zValue;
                        lastRatio = p2.zValue / p1.zValue < 0.75 ? 0.75 : p2.zValue / p1.zValue;
                        // 流畅处理
                        zoomTimeout = window.requestAnimationFrame(function () {
                            switch (nodeType) {
                                case "img":
                                    var minH = 200, maxH = 1500,
                                        minW = 200, maxW = 1500;
                                    picH = $cv.height(), picW = $cv.width(), w, h;

                                    switch (accord) {
                                        case "height":
                                            minH = getWH({ "ratio": lastRatio, "picValue": picH, "min": minH, "max": maxH });

                                            if (minH == maxH || minH == 200) {
                                                animating = false;
                                                return;
                                            }
                                            w = minH * picW / picH;
                                            h = minH;

                                            break;
                                        case "width":
                                            minW = getWH({ "ratio": lastRatio, "picValue": picW, "min": minW, "max": maxW });

                                            // 最大最小控制
                                            if (minW >= maxW || minW <= 200) {
                                                animating = false;
                                                return;
                                            }

                                            // 以宽为基准来缩放
                                            w = minW;
                                            h = picH * minW / picW;

                                            break;
                                    }

                                    $cv.css({ "width": w + "px", "height": h + "px" });
                                    break;
                                case "canvas":
                                    // 只有当手指有偏移才会有缩放
                                    if (Math.abs(p2.x1 - p1.x1) > 3 || Math.abs(p2.y1 - p1.y1) > 3 || Math.abs(p2.x2 - p1.x2) > 3 || Math.abs(p2.y2 - p1.y2) > 3) {
                                        $.fn.zoomOutOrIn({ "cvId": $cv, "temCv": cvTemp, "cV": cvFinal, ratio: lastRatio, "type": "zoom" });
                                    } else {
                                        animating = false;
                                        return;
                                    }
                                    break;
                            }
                            animating = false;
                        });
                        break;
                    default:
                        animating = false;
                        break;
                }
            }


            // 调用公用的手势操作方法
            $cv.gesture({
                "moveAble": settings.moveAble ? settings.moveAble : previewId,
                "touchstart": function (e) {
                    $.s_com.preventDefault(e);

                    // 第二只手指上去的时候touch也会执行
                    newLeft = 0;
                    newTop = 0;

                    cancelFrame();

                    // 如果不是缩放操作
                    // 记录相关坐标
                    accord = $cv.attr("accord");
                    switch (nodeType) {
                        case "canvas":
                            // 操作的画布
                            picW = parseInt($("#" + previewId).attr("datapicw"));
                            picH = parseInt($("#" + previewId).attr("datapich"));
                            break;
                        case "img":
                            // 记录原始left和top
                            orgLeft = parseInt($cv.css("left").replace("px", ""), 10);
                            orgTop = parseInt($cv.css("top").replace("px", ""), 10);
                            break;
                    }
                }, // touch的传入方法
                "drag": function (e, p1, p2) {
                    $.s_com.preventDefault(e);

                    // 配合requestAnimationFrame的标志
                    if (animating) return;
                    animating = true;

                    /// 在这里做点击和移动的判断                    
                    // 鼠标移动的距离
                    newLeft = p2.x - p1.x;
                    newTop = p2.y - p1.y;

                    nodeType == "img" ? (newLeft += orgLeft) && (newTop += orgTop) : "";

                    cancelFrame();

                    // 移动
                    actionType = "move";

                    // 流畅处理
                    moveTimeout = window.requestAnimationFrame(function () {
                        switch (nodeType) {
                            case "img":
                                $cv.css({ "left": newLeft + "px", "top": newTop + "px" });
                                break;
                            case "canvas":
                                cvFinal.style.cursor = "move";
                                $.fn.moveCallBack({ "cvId": $cv, "temCv": cvTemp, "cV": cvFinal, "x": newLeft, "y": newTop });
                                break;
                        }
                        animating = false;
                    });
                }, // 移动,拖动元素
                "rotateL": function (e, p1, p2) {
                    // 配合requestAnimationFrame的标志
                    if (animating) return;
                    animating = true;
                    rotateMove(e, "rotation", "rotatel");
                }, // 左旋转
                "rotateR": function (e, p1, p2) {
                    // 配合requestAnimationFrame的标志
                    if (animating) return;
                    animating = true;
                    // 右旋
                    rotateMove(e, "rotation", "rotater");
                }, // 左旋转
                "zoom": function (e, p1, p2) {
                    // 配合requestAnimationFrame的标志
                    if (animating) return;
                    animating = true;
                    rotateMove(e, "zoom", null, p1, p2);
                }, // 缩放
                "end": function (e, p1, p2) {
                    // 还原
                    window.initwidth = 1;

                    // 清除移动和缩放的延迟事件
                    cancelFrame();

                    // 手指移开后记录相关值
                    nodeType == "canvas" ? recodeValue(actionType) : "";
                    animating = false;
                }
            });
        };
        // set the default options of msnvisualcue functionality
        $.fn.moveScaleRotate.defaults = defaults;

        // 一次声明避免每次调用方法的时候都要申明
        var cv2DFinal, dx, dy, $cvId, minH, maxH, minW, maxW;

        // 缩放大
        $.fn.zoomOutOrIn = function (param) {
            // 缩放注意事项:
            // 缩放是基于宽来缩放还是基于高来缩放,这个是由预览的时候基于的值来选择的
            cv2DFinal = param.cV.getContext("2d"), $cvId = param.cvId,
            minH = 200, maxH = 1500,
            minW = 200, maxW = 1500,
            picH = parseInt($cvId.attr("datapich")), picW = parseInt($cvId.attr("datapicw"));

            if (param.type == "zoom") {
                // 只有缩放的时候才改变尺寸
                switch (accord) {
                    case "height":
                        minH = getWH({ "ratio": param.ratio, "picValue": picH, "min": minH, "max": maxH });

                        // 最大最小控制
                        if (minH >= maxH || minH <= 200) {
                            return;
                        }
                        // 基于原始图片的宽高来计算(不用改变后的宽高的原因:是因为随着频繁的计算,误差会进一步增加,从而导致缩放的变形)
                        picW = minH * cvTempW / cvTempH;
                        picH = minH;

                        break;
                    case "width":
                        minW = getWH({ "ratio": param.ratio, "picValue": picW, "min": minW, "max": maxW });

                        // 最大最小控制
                        if (minW >= maxW || minW <= 200) {
                            return;
                        }

                        // 以宽为基准来缩放
                        picW = minW;
                        picH = cvTempH * minW / cvTempW;

                        break;
                }

                // 画布中的图片尺寸
                $cvId.attr({ "datapicw": picW, "datapich": picH });
            }
            //保存画笔状态
            cv2DFinal.save();

            cv2DFinal.clearRect(0, 0, cvFinalW, cvFinalH);

            switch (param.type) {
                case "rotatel":
                    // 左旋转
                    rotateV = parseInt($cvId.attr("rotateV")) - 2;

                    $cvId.attr("rotateV", rotateV);
                    break;
                case "rotater":
                    // 右旋转
                    rotateV = parseInt($cvId.attr("rotateV")) + 2;

                    $cvId.attr("rotateV", rotateV);
                    break;
            }
            // 有角度旋转值后,就基于移动后的最后一个点来做旋转,画图的dx,dy需要重置为0,0
            // 设定一个旋转的中心点(就是画布中的图片移动后的那个点)
            // note:有空可以优化为基于图片的中心点来旋转(已经优化完了,围绕图片的中心来旋转)
            // 缩放的时候,以移动后的原始的图片尺寸和左上角坐标来计算出中心点
            cv2DFinal.translate(parseInt($cvId.attr("datacenterx")) + parseInt($cvId.attr("datacenterw")) / 2, parseInt($cvId.attr("datacentery")) + parseInt($cvId.attr("datacenterh")) / 2);

            // 如果旋转角度存在
            if (rotateV) {
                // 执行画布旋转
                cv2DFinal.rotate(rotateV * Math.PI / 180);
            }

            // 将临时画布中的按照缩放后的尺寸放进最终canvas
            cv2DFinal.drawImage(param.temCv, 0, 0, cvTempW, cvTempH, -picW / 2, -picH / 2, picW, picH);

            //绘制结束以后，恢复画笔状态
            cv2DFinal.restore();

            // 最后一次移动后的宽度和高度
            var dataCenterW = parseInt($cvId.attr("datacenterw"));
            var dataCenterH = parseInt($cvId.attr("datacenterh"));

            // 以图片中心缩放和旋转后,图片的左上角坐标也会发生相应的变化
            $cvId.attr({ "datapicx": parseInt($cvId.attr("datacenterx")) - (picW / 2 - dataCenterW / 2), "datapicy": parseInt($cvId.attr("datacentery")) - (picH / 2 - dataCenterH / 2) });
        };

        // canvas 移动重绘          
        $.fn.moveCallBack = function (param) {
            // 操作的画布
            cv2DFinal = param.cV.getContext("2d"), dx, dy, $cvId = param.cvId;
            cv2DFinal.save(); //保存画笔状态
            cv2DFinal.clearRect(0, 0, cvFinalW, cvFinalH);

            picX = parseInt($cvId.attr("datapicx"));
            picY = parseInt($cvId.attr("datapicy"));

            dx = picX + param.x;
            dy = picY + param.y;

            // 画布中的图片尺寸
            $cvId.attr({ "datapicw": picW, "datapich": picH });

            rotateV = parseFloat($cvId.attr("rotateV"));

            cv2DFinal.translate(dx + picW / 2, dy + picH / 2);

            if (rotateV) {
                // 执行画布旋转
                cv2DFinal.rotate(rotateV * Math.PI / 180);
            }

            // 只有还没有旋转的时候,移动是用坐标的
            cv2DFinal.drawImage(param.temCv, 0, 0, cvTempW, cvTempH, -picW / 2, -picH / 2, picW, picH);

            cv2DFinal.restore(); //绘制结束以后，恢复画笔状态
        };
    })(jQuery);
};