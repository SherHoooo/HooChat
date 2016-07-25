//虚拟时钟 
function getTime () {
    var datetime = new Date();
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1;
    var day = datetime.getDate();
    var hour = datetime.getHours();
    var minutes = datetime.getMinutes();
    month = numAdd(month);
    day = numAdd(day);
    hour = numAdd(hour);
    minutes = numAdd(minutes);
    $(".date-time").find(".date").html(year + "/" + month + "/" + day);
    $(".date-time").find(".time").html(hour + ":" + minutes);
}
function numAdd (n) {
    if(n < 10) {
        return "0" + n;
    }
    else return n;
}
getTime();
$(function(){
    setInterval("getTime()",10000)
    //绑定右侧弹出面板事件
    $(".note").click(function() {
            rightLayout({
                title: "待办事项",
                width: "400px",
                content: "#todolist"
            });
            gettodolist();

        //输入事项
        var input;
        $("input", "#todolist").keypress(function(e) {
            // 回车键事件
            if(e.which === 13) {
                input = $("input","#todolist").val();
                if(input===""){
                    tipLayerout({
                        content:"请输入内容！",
                        time:2000
                    })
                }
                else{
                    $.ajax({
                        type:"POST",
                        data:{content:input},
                        url:"request/submitTodolist",
                        success: function (res) {
                            if(res.errorCode ==0){
                                tipLayerout({content:res.msg, time:2000})
                            }
                            else{
                                $("input","#todolist").val("");
                                gettodolist();
                            }
                        }
                    })
                }
            }
        });

        //选中待处理事件
        $(".todolist","#todolist").delegate(".item .inputlike","click",function(){
            var item = $(this).parent();
            var id = item.attr("name");
            $.ajax({
                type:"POST",
                data:{id:id},
                url:"request/doneTodolist",
                success:function(res){
                    if(res.errorCode==0){tipLayerout({content:res.msg, time:2000})}
                    else{
                        var list = item.clone(true);
                        list.addClass("done");
                        $(".donelist","#todolist").append(list);
                        item.remove();
                    }
                }
            })
        });

        //tab切换
        $(".tab","#todolist").delegate("span","click",function(){
            if($(this).attr("class").substring(0,4)=="todo"){
                $(".tab","#todolist").find("span").first().removeClass("unactive");
                $(".tab","#todolist").find("span").last().addClass("unactive");
                $(".todolist","#todolist").show();
                $(".donelist","#todolist").hide();
                $(".deleteAll","#todolist").hide();
            }
            else{
                $(".tab","#todolist").find("span").last().removeClass("unactive");
                $(".tab","#todolist").find("span").first().addClass("unactive");
                $(".todolist","#todolist").hide();
                $(".donelist","#todolist").show();
                $(".deleteAll","#todolist").show();
            }
        });
        //清空已完成任务
        $(".deleteAll","#todolist").click(function(){
            $.ajax({
                type:"POST",
                data:null,
                url:"request/deleteAllTodolist",
                success:function(res){
                    if(res.errorCode==0){tipLayerout({content:res.msg, time:2000})}
                    else{
                        gettodolist();
                    }
                }
            });
        });

        return false;
    });

    $("body").click(hideRightLayout);

    //绑定注册登录及背景出现事件
    $(".qq-icon","#wrapper").bind("click", bgdown);
    $(".qqmsg","#bottom-nav").bind("click",bgdown);
    function bgdown(){
        $("#bigBg").attr("style","top:0;");
        $("#signName").val("");
        $("#logName").val("");
        $("#signPwd").val("");
        $("#logPwd").val("");
        $("#signMobile").val("");
    }
    $(".upBigBg","#bigBg").bind("click", function () {
        $("#bigBg").attr("style","top:-100%;");
        $("#signName").val("");
        $("#logName").val("");
        $("#signPwd").val("");
        $("#logPwd").val("");
        $("#signMobile").val("");
        $(".submit","#logIn").find(".bg").attr("style","width:0;height:0");
        $(".submit","#signUp").find(".bg").attr("style","width:0;height:0");
    });
    //绑定注册登录上滑下滑事件
    $("#signUp").bind("click", function () {
        $("#logIn").attr("style","top:467px;");
    });
    $("#logIn").bind("click", function () {
        $(this).attr("style","top:30px;");
    });
    
    //验证手机号用户名是否正确
    var mobileCheck = /^1[3|4|5|7|8][0-9]{9}$/;
    $("#signName").keyup(function () {
        var name = $("#signName").val();
        if(!name) {
            $(".signNameYes").hide();
            $(".signNameNo").show();
        }
        else {
            $.ajax({
                type: "POST",
                url: "request/signUpName",
                data: { name: $("#signName").val()},
                success: function(res) {
                    if (res.errorCode == 0) {
                        $(".signNameYes").hide();
                        $(".signNameNo").show();
                    } else {
                        $(".signNameYes").show();
                        $(".signNameNo").hide();
                    }
                }
            })
        }
    });
    $("#signMobile").keyup(function () {
        var mobile = $("#signMobile").val();
        if(!mobileCheck.test(mobile)) {
            $(".signMobileYes").hide();
            $(".signMobileNo").show();
        }
        else {
            $.ajax({
                type: "POST",
                url: "request/signUpMobile",
                data: { mobile: mobile},
                success: function(res) {
                    if (res.errorCode == 0) {
                        $(".signMobileYes").hide();
                        $(".signMobileNo").show();
                    } else {
                        $(".signMobileYes").show();
                        $(".signMobileNo").hide();
                    }
                }
            })
        }
    });


    //提交登陆注册信息
    $(".submit","#signUp").bind("click",signUp);
    $("#signPwd").keypress(function (e) {
        if(e.which === 13) {
            signUp();
        }
    });
    function　 signUp() {
        var name = $("#signName").val();
        var pwd = $("#signPwd").val();
        var mobile = $("#signMobile").val();
        if (name == "" || pwd == "" || mobile == "") { tipLayerout({ content: "有未填完的项喔", time: 2000 }) } else {
            if (!mobileCheck.test(mobile)) { tipLayerout({ content: "请填写正确的手机号", time: 2000 }) } else {
                $(this).find(".bg").attr("style", "width:100%;height:100%");
                $.ajax({
                    type: "POST",
                    url: "request/signUp",
                    data: { name: name, pwd: pwd, mobile: mobile },
                    success: function(res) {
                        if (res.errorCode == 0 || res.errorCode == 2) {
                            tipLayerout({ content: res.msg, time: 2000 });
                            $(".submit", "#signUp").find(".bg").attr("style", "width:0;height:0");
                        } else {
                            $("#sign-log").fadeOut(300);
                            $("#main_Hoo").fadeIn(300);

                            $(".user-logo", ".col-1").find("img").attr("src", "img/" + res.userinfo.userlogo);
                            $(".user-logo", ".col-1").find("img").attr("class", res.userinfo.id);
                            //打开聊天室主界面并建立io链接
                            var chatlist = {};
                            var talklist = {};
                            var socket = io.connect('http://localhost:8000');
                            socketStart(socket, chatlist, talklist, res.userinfo);
                        }
                    }
                })
            }
        }
    }

    $(".submit","#logIn").bind("click",logIn);
    $("#logPwd").keypress(function (e) {
        if(e.which === 13) {
            logIn();
        }
    });
    function logIn(){
        var name = $("#logName").val();
        var pwd = $("#logPwd").val();
        if(name==""||pwd==""){tipLayerout({content:"有未填完的项喔", time:2000})}
        else{
            $(this).find(".bg").attr("style","width:100%;height:100%");
            $.ajax({
                type:"POST",
                url:"request/logIn",
                data:{name:name,pwd:pwd},
                success: function (res) {
                    if(res.errorCode==0 || res.errorCode == 2){
                        tipLayerout({content : res.msg, time:2000});
                        $(".submit","#logIn").find(".bg").attr("style","width:0;height:0");
                    }
                    else{
                        $("#sign-log").fadeOut(300);
                        $("#main_Hoo").fadeIn(300);
                        //将用户信息传递到页面中
                        var userinfo = res.userinfo;
                        var friends = res.friends;
                        var msgs = res.msgs;
                        var talks = res.talks;

                        $(".user-logo",".col-1").find("img").attr("src","img/" + userinfo.userlogo);
                        $(".user-logo",".col-1").find("img").attr("class",userinfo.id);
                        //朋友列表
                        if(friends) {
                            $.each(friends, function (index, val) {
                                var li = $(".friends-ul", ".col-2").find("li.friend").first().clone(true);
                                li.attr("style", "");
                                li.find("img").attr("alt", val.id);
                                li.find("img").attr("src", "img/" + val.userlogo);
                                li.find("span.friend-name").html(val.name);
                                $(".friends-ul",".col-2").append(li);
                            });
                        }
                        //聊天消息列表
                        var chatlist = {}; //存放当前聊天列表
                        if(msgs) {
                            $.each(msgs, function (index, val) {
                                var id = val.postUser.id.toString();
                                if(chatlist[id] == null) {
                                    chatlist[id] = {
                                        user : val.postUser,
                                        datas : [{
                                            content : val.content,
                                            time : val.time,
                                            type : val.type
                                        }]
                                    }
                                }
                                else{
                                    chatlist[id].datas.push({
                                        content : val.content,
                                        time : val.time,
                                        type : val.type
                                    })
                                }
                            });

                            //显示当前消息列表
                            $.each(chatlist, function (index, val) {
                                var li = $(".msgs-ul", ".col-2").find("li.singleMsg").first().clone(true);
                                li.attr("style", "");
                                li.children("span").html(val.datas.length);
                                li.children("span").attr("style", "display:block");
                                li.find("img").attr("src", "img/" + val.user.userlogo);
                                li.attr("id", val.user.id);
                                li.find("span.name").html(val.user.name);
                                var time = makeDate(val.datas[val.datas.length-1].time);
                                li.find("span.time").html(time);
                                if(val.datas[val.datas.length-1].type == 1) {
                                    li.find("p").html(val.datas[val.datas.length-1].content + "请求添加您为朋友");
                                }
                                else {
                                    li.find("p").html(val.datas[val.datas.length-1].content);
                                }
                                $(".msgs-ul",".col-2").append(li);
                            });
                        }
                        //群聊列表
                        var talklist = {};
                        var talkmsgsnum = 0;
                        if(talks) {
                            $.each(talks, function (index, val) {
                                var id = val.talkinfo.id.toString();
                                //从返回值中剔除用户本身
                                var member = val.talkinfo.member.split(",");
                                var userself = $.inArray(res.userinfo.id + "", member);
                                member.splice(userself, 1);
                                val.talkmember.splice(userself, 1);
                                var length = member.length;
                                var item = $(".friends-ul", ".col-2").find(".talks").first().clone();
                                if(length == 2) {
                                    $.each(val.talkmember, function (index, val) {
                                        var img = $(".user-logo", ".col-1").children("img").clone();
                                        img.attr("src", "img/" + val.userlogo);
                                        img.attr("class", val.id);
                                        img.attr("alt", val.name);
                                        item.children(".talks-logo").append(img);
                                    });
                                    item.children(".talks-logo").addClass("twoman");
                                }
                                else if(length == 3) {
                                    $.each(val.talkmember, function (index, val) {
                                        var img = $(".user-logo", ".col-1").children("img").clone();
                                        img.attr("src", "img/" + val.userlogo);
                                        img.attr("class", val.id);
                                        img.attr("alt", val.name);
                                        item.children(".talks-logo").append(img);
                                    });
                                    var userimg = $(".user-logo", ".col-1").children("img").clone();
                                    userimg.attr("alt", userinfo.name);
                                    item.children(".talks-logo").append(userimg);
                                    item.children(".talks-logo").addClass("threeman");
                                }
                                else if(length >= 4 && length <= 8) {
                                    $.each(val.talkmember, function (index, val) {
                                        if(index <= 3) {
                                            var img = $(".user-logo", ".col-1").children("img").clone();
                                            img.attr("src", "img/" + val.userlogo);
                                            img.attr("class", val.id);
                                            img.attr("alt", val.name);
                                            item.children(".talks-logo").append(img);
                                        }
                                        else {
                                            return 0;
                                        }
                                    });
                                    item.children(".talks-logo").addClass("threeman");
                                }
                                else if(length >8) {
                                    $.each(val.talkmember, function (index, val) {
                                        if(index <= 8) {
                                            var img = $(".user-logo", ".col-1").children("img").clone();
                                            img.attr("src", "img/" + val.userlogo);
                                            img.attr("class", val.id);
                                            img.attr("alt", val.name);
                                            item.children("div").append(img);
                                        }
                                        else {
                                            return 0;
                                        }
                                    });
                                    item.children(".talks-logo").addClass("nineman");
                                }
                                item.children(".friend-name").html(val.talkinfo.name);
                                item.attr("style", "display: block");
                                item.addClass(val.talkinfo.id + "");
                                $(".friends-ul", ".col-2").children(".talks").first().after(item[0]);

                                //群聊消息
                                if(val.talkmsgs.length > 0) {
                                    talklist[id] = val;       //在群聊消息列表中加入该群聊信息
                                    var li = $(".msgs-ul", ".col-2").find("li.talks").first().clone(true);
                                    var logo = item.children(".talks-logo").clone(true);
                                    li.prepend(logo);
                                    li.addClass(val.talkinfo.id + "");
                                    li.attr("style", "");
                                    li.children("span").html(val.talkmsgs.length);
                                    li.children("span").attr("style", "display:block");
                                    li.find("span.name").html(val.talkinfo.name);
                                    var time = makeDate(val.talkmsgs[val.talkmsgs.length-1].time);
                                    li.find("span.time").html(time);
                                    if(val.talkmsgs[val.talkmsgs.length-1].type == 1) {
                                        li.find("p").html("[系统消息]");
                                    }
                                    else {
                                        li.find("p").html(val.talkmsgs[val.talkmsgs.length-1].content);
                                    }
                                    $(".msgs-ul",".col-2").append(li);
                                }

                                //群聊未读消息数
                                talkmsgsnum += val.talkmsgs.length;
                            });
                        }

                        //显示未读消息数
                        if(res.msgs.length > 0 || talkmsgsnum > 0) {
                            $(".msgs", ".col-1").html(res.msgs.length + talkmsgsnum);
                        }
                        //打开聊天室主界面并建立io链接
                        var socket = io.connect('http://localhost:8000');
                        socketStart(socket, chatlist ,talklist, userinfo);
                    }
                }
            })
        }
    }



});

function gettodolist(){
    $(".todolist","#todolist").find(".item").remove();
    $(".donelist","#todolist").find(".item").remove();
    $.ajax({
        type:"GET",
        data:null,
        url:"request/getTodolist",
        success:function(res){
            $.each(res.datas,function(index,value){
                var list;
                if(value.done ==0){
                    list = $(".item","#todolist").last().clone(true);
                    list.attr("name",value.listId);
                    list.find("span").html(value.content);
                    $(".todolist","#todolist").prepend(list);
                }
                else{
                    list = $(".item","#todolist").last().clone(true);
                    list.attr("name",value.listId);
                    list.find("span").html(value.content);
                    list.addClass("done");
                    $(".donelist","#todolist").prepend(list);
                }
            });
        }
    });
}
