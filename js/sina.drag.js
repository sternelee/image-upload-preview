///////////////////////////////////////////////////////////////////////////////////
//// 移动端元素
//// File: sina.drag.js,支持移动网页元素(网页元素需要绝对定位)
//// Defines: $("#previewimg").drag({"moveAble":"upload"})
//// Description: 移动元素：implements the sSina jQuery extension method
////
//// 在img中预览使用方法:$("#previewimg").drag({"moveAble":"upload","stopPop":true})
//// 在canvas中预览使用方法:$("#previewimg").drag({"moveAble":"upload","stopPop":true})
//// 配置moveAble可以增大操控区域
//// 配置stopPop可以阻止时间冒泡
//// 配置containerWidth,containerHeight可以根据合适的尺寸进行缩放
//// Copyright (c) 2013 by Sina Corporation. All rights reserved.
//// 注意，如果是拖动textarea等可编辑的文本框,需要先设置焦点($("textarea").focus()),来激发相关事件;
//// 联系人 Even:373384979
///////////////////////////////////////////////////////////////////////////////////
///// <reference path="jquery-1.4.2.js" />
//// 对common.js有依赖
sSina.drag = function () {
    (function ($) {
        var defaults = {
            stopPop: false, // 是否阻止事件冒泡
            containerWidth: 100, // 可移动的画布的宽度
            containerHeight: 100, // 可移动的画布的高度
            moveAble: null// 如果存在这个id表示:用户可以在图片外的父级元素进行移动操作
        };
        // 图片右上角的点到canvas0,0的坐标
        var actionType;

        // 手势行为
        $.fn.drag = function (options) {
            var settings = $.extend(true, {}, defaults, options),
                orgLeft, orgTop, newLeft = 0, newTop, moveTimeout;
            var $cv = settings.moveAble ? $(settings.moveAble) : $(this), cvWidth, cvHeight;

            // 需要用定位的属性            
            //$cv.css({"left":"0px","top":"0px","position":"absolute"});

            // 调用公用的手势操作方法
            $cv.gesture({
                "moveAble": settings.moveAble ? settings.moveAble : null,
                "touchstart": function (e) {
                    $.s_com.preventDefault(e);

                    settings.stopPop ? e.stopPropagation() : "";

                    // 第二只手指上去的时候touch也会执行
                    newLeft = 0;
                    newTop = 0;

                    cvWidth = $cv.width();
                    cvHeight = $cv.height();

                    // 记录相关坐标
                    // 记录原始left和top
                    orgLeft = parseInt($cv.css("left").replace("px", ""), 10);
                    orgTop = parseInt($cv.css("top").replace("px", ""), 10);
                }, // touch的传入方法
                "drag": function (e, p1, p2) {
                    $.s_com.preventDefault(e);
                    settings.stopPop ? e.stopPropagation() : "";

                    /// 在这里做点击和移动的判断                    
                    // 鼠标移动的距离
                    newLeft = p2.x - p1.x;
                    newTop = p2.y - p1.y;

                    newLeft += orgLeft;
                    newTop += orgTop;

                    newLeft = newLeft <= 0 ? 0 : newLeft;
                    newTop = newTop <= 0 ? 0 : newTop;

                    newLeft = newLeft >= settings.containerWidth - cvWidth ? settings.containerWidth - cvWidth : newLeft;
                    newTop = newTop >= settings.containerHeight - cvHeight ? settings.containerHeight - cvHeight : newTop;

                    // 移动
                    actionType = "move";
                    // 流畅处理
                    $cv.css({ "left": newLeft + "px", "top": newTop + "px", "cursor": "move" });
                },
                "end": function (e, p1, p2) {
                    // 还原
                    window.initwidth = 1;
                }
            });
        };
        // set the default options of msnvisualcue functionality
        $.fn.drag.defaults = defaults;
    })(jQuery);
};