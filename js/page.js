sSina.page = function () {
    // 微信微博签名获取
    $.wxWb.getSign("", "", $.sCallBack.getSignCallBack); // 第一个参数可以动态配置(默认不写,有特殊更改,再指定):{"wxSignApi":"/2014adframe/weixin/getSignPackage.php?v=1","wbSignApi":"/weiboweixin/lightapp/getSignPackage.php?v=1"}

    // 响应file的回调
    // canvas预览的情况下,预览后会返回cv图片数据供缩放,移动和旋转
    var previewCallback = function (previewId, cv) {
        if (previewId) {
            // 如果是用canvas来预览
            // 将loading层隐藏
            $(".previewloading").hide();

            //            // 先解绑
            $("#previewimg").gestureDispose({ "moveAble": ".upload" });

            //            // 移动图片加手势缩放操作,传入temCV以增加用户体验,操作起来更流畅
            //            // 图片的移动,缩放和旋转
            //            // canvas中预览和img预览的区别在于是否有cv的返回
            cv ? $("#previewimg").moveScaleRotate({ "moveAble": ".upload", "temCV": cv }) : $("#previewimg").moveScaleRotate({ "moveAble": ".upload" });
        } else {
            // 预览失败
            $(".previewloading").hide();
        }
    };
    // 在微信和微博中会隐藏file元素(在scallback.js中的签名回调中隐藏)
    // (微信中还是采用第三方浏览器的逻辑,因为微信中图片在canvas中存在安全性问题)
    // 另选图片本地预览,将图片放入临时canvas中,方便后续操作
    // accord传入参数可选,决定了以宽还是高来缩放图片
    $("#uploadfirst").preview({
        "wxWbBtn": ".wxwbbtn", // [2015/11/30新增功能]微信微博选择图片的button的class(微信中还是采用第三方浏览器的逻辑,因为微信中图片在canvas中存在安全性问题)
        "previewId": "previewimg", // 预览的对象id
        "callBack": previewCallback, // 回调
        "containerW": 580, // 可操作区域的宽度
        "containerH": 406 // 可操作区域的高度
    });

    //微信（安卓）给拍照功能
    if (navigator.userAgent.toLowerCase().indexOf("micromessenger") != -1) {
        $("#uploadfirst").attr("capture", "camera");
    }

    $(".logo").drag({
        stopPop: true,
        "containerWidth": 580, // 大图镂空的宽度
        "containerHeight": 406// 大图镂空的高度
    });

    $(".next_step").click(function () {
        // 图片裁剪
        $.cutCompose.cut({
            "ratio": 100, // 压缩比率
            "source": "previewimg", // 图片绝对路径(含http)或者图片id
            "left": $("#previewimg").position().left, // 图片的x偏移
            "top": $("#previewimg").position().top, // 图片的y偏移
            "width": 580, // 镂空/或者图片可以移动的区域的宽度
            "height": 406, // 镂空/或者图片可以移动的区域的高度
            "callBack": function (base64) {
                $.s_com.getId("cutimage").src = base64;
                // 合成
                $.cutCompose.merge({
                    "ratio": 50, // 压缩比率
                    "source": base64, // 传入裁剪后的图片数据
                    "modesource": "images/xk.png", // 图片绝对路径
                    "offSetLeft": 30, // 从模板图片的哪一点X值开始贴图合成
                    "offSetTop": 32, // 从模板图片的哪一点Y值开始贴图合成
                    "width": 580, // 镂空/或者图片可以移动的区域的宽度
                    "height": 406, // 镂空/或者图片可以移动的区域的高度
                    "callBack": function (base64str) {
                        // 返回合成之后的img数据
                        $.s_com.getId("mergeimage").src = base64str;

                        // 如果要上传最好采用jpegencode.js的压缩方式来压缩
                        //base64str已经是压缩的图片了,可以指定压缩比率,如果有要求的话

                        //alert("字节数:"+$.s_com.getBytesLen(base64str));
                    }
                });
            }
        });

    });
};
