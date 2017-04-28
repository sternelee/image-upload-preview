///////////////////////////////////////////////////////////////////////////////////
////
//// File: sCallBack.js
//// Defines: $.sCallBack.action()
//// Description: 回调函数--常常变动：implements the sCallBack jQuery extension method
////
//// 使用方法:$.sCallBack.action()
//// Copyright (c) 2013 by Sina Corporation. All rights reserved.
//// 
///////////////////////////////////////////////////////////////////////////////////
///// <reference path="jquery-1.4.2.js" />
sSina.sCallBack = function () {
    (function ($) {
        var sConfig = {
        };
        var sCallBack = {
            getSignCallBack: function (result, successOrNot, json) {
                // 该方法会在微博/微信签名获取成功有效后执行
                var signCB = function () { };
                if (parseInt(successOrNot)) {
                    signCB = function () {
                        // 改值表示签名成功
                        window.wxWbSignFlag = true;
                        //页面打开就执行的需要写在这里
                        // 如果需要在页面加载时就调用相关接口，则须把相关接口放在回调函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在该回调函数中。                        
                        // 页面打开就设置微信微博分享内容(可以在事件中直接调用,可以单独指定一种分享去向,如果需要)
                        $.wxWb.setShareContent({
                            //(微信)分享到朋友圈参数配置
                            "onMenuShareTimeline": {
                                title: "分享标题",
                                link: "分享带的链接",
                                imgUrl: "分享的带图",
                                trigger: function (res) { }, // 用户点击分享到朋友圈
                                success: function (res) { }, // 已经分享
                                cancel: function (res) { } // 已经取消
                            },
                            //分享给微信好友的参数配置
                            "onMenuShareAppMessage": {
                                title: "分享标题",
                                desc: "分享所带的描述",
                                link: "分享链接",
                                imgUrl: "分享的带图",
                                trigger: function (res) { }, // 用户点击分享给朋友
                                success: function (res) { }, // 已经分享
                                cancel: function (res) { } // 已经取消
                            },
                            // 设置微博app中的分享到各个社交平台的分享参数配置
                            "setSharingContent": {
                                "title": "分享标题", // title 表示标题
                                "icon": "分享的带图", // 图片的 URL                                 
                                "desc": "分享所带的描述", // desc 表示文案
                                "callBack": function (params, success, code) { } //设置完后的回调
                            }
                        }, function () {
                            // 设置成功后的回调
                        });

                        // 网络连接类型获取          
                        //                        $.wxWb.getNetworkType({
                        //                                //微信回调
                        //                            "wxCallBack" : {
                        //                                "success" : function(res){
                        //                                    $(".networktype").text(res.networkType);
                        //                                }
                        //                            },
                        //                            // 微博回调
                        //                            "wbCallBack" : function(params, success, code){
                        //                                $(".networktype").text(params.network_type);
                        //                            }
                        //                        });
                        //                        // 微博支持网络状态改变是通知网页
                        //                        $.wxWb.onNetWorkChange({
                        //                            // 微博回调
                        //                            "wbCallBack" : function(params){
                        //                                $(".networktype").text(params.network_type);
                        //                            }
                        //                        });
                        // 针对有的接口,在微信微博差异性,可以单独处理
                        switch (json.appName) {
                            case "weixin":
                                // 微信特殊处理

                                break;
                            case "weibo":
                                // 微博特殊处理
                                // 照片上传部分将file隐藏(使用微博的系统选择照片)
                                $("#uploadfirst").hide();
                                break;
                            default:
                                break;
                        }
                    }

                    // 签名后的初始化
                    $.wxWb.getSignInit(result, json, signCB);
                } else {
                    // 接口返回失败调用的方法
                    $.s_com.sendMonitor('send', 'event', 'button', 'wxshare', 'wxsharefailed', 1, 'wxshare:failed');
                }
            }
        };
        $.extend({ sCallBack: sCallBack });
    })(jQuery);
};