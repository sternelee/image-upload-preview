///////////////////////////////////////////////////////////////////////////////////
////
//// File: sSina.js
//// Defines: $.sSina.action()
//// Description: 登录：implements the sSina jQuery extension method
////
//// 使用方法:$.sSina.action()
//// Copyright (c) 2013 by Sina Corporation. All rights reserved.
//// 
///////////////////////////////////////////////////////////////////////////////////
///// <reference path="jquery-1.4.2.js" />
sSina.sSina = function () {
    (function ($) {
        var defaults = {
            url: "http://all.vic.sina.com.cn"
        };
        var sSina = {
            // 含分享,加关注,信息提交等
            postApi: function (url, json, btn, bindFun, callBack, parentDom) {
                if (!url) return; // url为空直接返回
                $.ajax({
                    url: url + "&" + Math.random(),
                    type: json.ajaxtype,
                    data: json,
                    dataType: json.dType,
                    success: function (data) {
                        // 再次绑定
                        btn ? $(btn).bind("click", bindFun) : "";

                        try {
                            data ? callBack(data, 1, json) : callBack(0, 0, json);
                        } catch (e) {
                            callBack(0, 0, json);
                        }
                    },
                    error: function (error) {
                        btn ? $(btn).bind("click", bindFun) : "";
                        callBack(0, 0, json);
                    }
                });
            }
        };
        $.extend({ sSina: sSina });
    })(jQuery);
};