$(function(){
    drag();
    tab();
    addScroll();
});

//窗口可拖拽
function drag(){
    var dragObj = $(".col-1","#main_Hoo");
    dragObj.bind("mousedown",function(event){
        //获取元素离页面的偏移量
        var offset_x = $("#main_Hoo")[0].offsetLeft;
        var offset_y = $("#main_Hoo")[0].offsetTop;
        //获取当前鼠标坐标
        var mouse_x = event.pageX;
        var mouse_y = event.pageY;
        $(document).bind("mousemove", function (ev) {
            //计算偏移长度
            var _x = ev.pageX - mouse_x;
            var _y = ev.pageY - mouse_y;
            //计算偏移后坐标
            var now_x = (offset_x + _x ) + "px";
            var now_y = (offset_y + _y ) + "px";
            $("#main_Hoo").css({
                top:now_y,
                left:now_x
            });
        });
    });
    //解除绑定
    $(document).bind("mouseup", function () {
        $(this).unbind("mousemove");
    });
}

//第一列tab切换
function tab () {
    $(".friends",".col-1").bind('click', function () {
        $(this).addClass("active");
        $(".msgs",".col-1").removeClass("active");
        $(".friends-ul",".col-2").show();
        $(".msgs-ul",".col-2").hide();
    });
    $(".msgs",".col-1").bind('click', function () {
        $(this).addClass("active");
        $(".friends",".col-1").removeClass("active");
        $(".friends-ul",".col-2").hide();
        $(".msgs-ul",".col-2").show();
    });
}

//第二列选中
$(".col-2").delegate("li", 'click', function () {
    $(".active",".col-2").removeClass("active");
    $(this).addClass("active");
});

//添加滚动
function addScroll(){
    $(".col-2","#main_Hoo").mCustomScrollbar({
        axis:"y",
        theme:"rounded",
        mouseWheelPixels: "50px",
        scrollbarPosition:"outside"
    });
    $("#show_msgs").mCustomScrollbar({
        axis:"y",
        theme:"light-thin",
        mouseWheelPixels: "50px",
        scrollbarPosition:"outside"
    });
    $(".choose-list","#add_talks").mCustomScrollbar({
        axis:"y",
        theme:"light-thin",
        mouseWheelPixels: "50px",
        scrollbarPosition:"outside"
    });
    $(".result-list","#add_talks").mCustomScrollbar({
        axis:"y",
        theme:"light-thin",
        mouseWheelPixels: "50px",
        scrollbarPosition:"outside"
    });
}

//添加好友窗口出现消失
$(".add-friend",".friends-ul").bind('click', function () {
    $("#add_friend").show();
});
$(".close","#add_friend").bind('click', function () {
    $("#add_friend").hide();
    $("input","#add_friend").val("");
    $(".show-result","#add_friend").hide();
});

//搜索好友
$("input","#add_friend").keypress(function (e) {
    if(e.which === 13) {
        var addfriend = $(this).val();
        if(addfriend === null) { tipLayerout({content:'请输入内容', time:2000}) }
        else {
            $.ajax({
                type : "POST",
                data : { search : addfriend },
                url : "request/addfriend",
                success : function (res) {
                    if(res.errorCode ==0){ tipLayerout({content: res.msg, time:2000}) }
                    else {
                        $(".show-result","#add_friend").find("img").attr("src", "img/" + res.data.userlogo);
                        $(".show-result","#add_friend").find("img").attr("class", res.data.id);
                        $(".show-result","#add_friend").find("span").html(res.data.name);
                        if(res.data.id == $(".user-logo",".col-1").find("img").attr("class")) {
                            $(".show-result","#add_friend").find("div").css("display", "none");
                        }
                        else{
                            $(".show-result","#add_friend").find("div").css("display", "block");
                        }
                        $(".show-result","#add_friend").show();
                    }
                }
            })
        }
    }
});

//添加群聊
var talkslist = [];
$(".add-talks",".friends-ul").bind('click', function () {
    var friends = $(".friends-ul", ".col-2").find(".friend");
    talkslist = [];
    $.each(friends, function (index, val) {
        var item = $(val).clone(true);
        item.children("div").remove();
        $(".choose-list", "#add_talks").find("#mCSB_3_container").append(item);
    });
    $("#add_talks").show();
});
$(".close","#add_talks").bind('click', closeAddTalks);
function closeAddTalks() {
    $("#add_talks").hide();
    $(".choose-list","#add_talks").find("#mCSB_3_container").empty();
    $(".result-list","#add_talks").find("#mCSB_4_container").empty();
    $(".submit-talks", "#add_talks").attr("style", "display: none");
    talkslist = [];
}
$(".choose-list", "#add_talks").delegate("li", "click", function () {
    var itemid = $(this).find("img").attr("alt");
    if($.inArray(itemid, talkslist) === -1) {
        talkslist.push(itemid);
        var item = $(this).clone(true);
        $(".result-list", "#add_talks").find("#mCSB_4_container").prepend(item);
        var length = $(".result-list", "#add_talks").find("#mCSB_4_container").find("li").length;
        if(length >= 2) {
            $(".submit-talks", "#add_talks").attr("style", "display: block");
        }
        else {
            $(".submit-talks", "#add_talks").attr("style", "display: none");
        }
    }
});

//添加文字编辑功能
//加大字体
$(".text-edit").children(".font-add").bind("click", function () {
    var fontsize = $("#msg_text").css("font-size");
    fontsize = fontsize.substring(0,2);
    fontsize = parseInt(fontsize);
    if(fontsize < 24) {
        $("#msg_text").css("font-size", fontsize + 2 + "px");
        $(".top").children(".msg-item").find(".wrapper").css("font-size", fontsize + 2 + "px");
    }
});
//减小字体
$(".text-edit").children(".font-decrese").bind("click", function () {
    var fontsize = $("#msg_text").css("font-size");
    fontsize = fontsize.substring(0,2);
    fontsize = parseInt(fontsize);
    if(fontsize > 12) {
        $("#msg_text").css("font-size", fontsize - 2 + "px");
        $(".top").children(".msg-item").find(".wrapper").css("font-size", fontsize - 2 + "px");
    }
});
//粗体
$(".text-edit").children(".font-weight").bind("click", function () {
    var fontweight = $("#msg_text").css("font-weight");
    if(fontweight == "400") {
        $("#msg_text").css("font-weight", "600");
        $(".top").children(".msg-item").find(".wrapper").css("font-weight", "600");
    }
    else {
        $("#msg_text").css("font-weight", "400");
         $(".top").children(".msg-item").find(".wrapper").css("font-weight", "400");
    }
});
//斜体
$(".text-edit").children(".font-italic").bind("click", function () {
    var fontstyle = $("#msg_text").css("font-style");
    if(fontstyle == "normal") {
        $("#msg_text").css("font-style", "italic");
        $(".top").children(".msg-item").find(".wrapper").css("font-style", "italic");
    }
    else {
        $("#msg_text").css("font-style", "normal");
        $(".top").children(".msg-item").find(".wrapper").css("font-style", "normal");
    }
});