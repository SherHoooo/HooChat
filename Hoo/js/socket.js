function socketStart(socket, chatlist, talklist, userinfo) {
    //参数定义
    var chatingId; //存储当前私人聊天Id
    var talkingId; //存储当前群聊Id
    var userId = userinfo.id;
    var unread;   //未读消息总数
    if(!$(".msgs", ".col-1").html()) {
        unread = 0
    }
    else {
        unread = parseInt($(".msgs", ".col-1").html());
    }


    //发送用户Id
    socket.emit('getUserId', userId);

    //发送添加好友请求
    $(".send-req", "#add_friend").bind("click", function () {
        var friendid = $(".show-result", "#add_friend").find("img").attr("class");
        var data = {owner : userId, friend : friendid, ownername : userinfo.name};
        socket.emit("addfriend", data);
        $("#add_friend").hide();
        tipLayerout({content:"发送成功", time:2000});
    });

    //第二列选中
    $(".msgs-ul").delegate("li", 'click', function () {
        //改变未读消息数
        var msgunread = $(this).children("span").html();
        if(msgunread) {
            msgunread = parseInt(msgunread);
        }
        else { msgunread = 0 }
        unread = unread - msgunread;
        if(unread > 0) {$(".msgs", ".col-1").html(unread);}
        else {$(".msgs", ".col-1").html("");}
        $(this).children("span").attr("style", "display:none");
        $(this).children("span").html("");

        $("#mCSB_2_container", "#show_msgs").html("");    //清空上一个对话消息
        $("#msg_text").val("");    //清空输入框内容
        $(".show","#main_Hoo").hide();
        $(".chat","#main_Hoo").show();

        var title;
        var img;
        var msgitem;

        if($(this).attr("class").substring(0,9) == "singleMsg") {
            talkingId = null; //置空群聊存储id

            title = $(this).find("h4").find("span").first().html();
            img = $(this).children("img").attr("src");
            $("h5.title",".col-3").html(title);
            chatingId = $(this).attr("id");  //获取聊天窗口对话人id

            $.each(chatlist[chatingId+''].datas, function (index, val) {
                if(val.type == 0) {
                    msgitem = $(".top", ".col-3").find(".msg-item").first().clone(true);
                    msgitem.attr("style", "display:block");
                    msgitem.addClass("left");           //添加左边消息样式
                    msgitem.find("img").attr("src", img);
                    msgitem.find("h4").html(title);
                    msgitem.find(".text").find(".wrapper").html(val.content);
                    $("#mCSB_2_container", "#show_msgs").append(msgitem);
                }
                else if(val.type == 1) {
                    $(".msgs-ul").find("#" + chatingId).children("p").html(val.content + "请求添加您为好友");
                    msgitem = $(".top", ".col-3").find(".add-friend-req").first().clone(true);
                    msgitem.attr("style", "display:block");
                    msgitem.children("div").attr("class", index);
                    msgitem.find(".post-user").html(val.content);
                    $("#mCSB_2_container", "#show_msgs").append(msgitem);
                }
                else if(val.type == 2) {
                    msgitem = $(".top", ".col-3").find(".msg-item").first().clone(true);
                    msgitem.attr("style", "display:block");
                    msgitem.addClass("right");           //添加右边消息样式
                    msgitem.find("img").attr("src", "img/" + userinfo.userlogo);
                    msgitem.find(".text").find(".wrapper").html(val.content);
                    $("#mCSB_2_container", "#show_msgs").append(msgitem);
                }
                else if(val.type == 3) {
                    $(".msgs-ul").find("#" + chatingId).children("p").html(val.content + "请求添加您为好友");
                    msgitem = $(".top", ".col-3").find(".add-friend-req").first().clone(true);
                    msgitem.attr("style", "display:block");
                    msgitem.children("div").attr("class", index);
                    msgitem.find(".post-user").html(val.content);
                    msgitem.find(".accept").html("已接受");
                    msgitem.find(".accept").addClass("forbidden");
                    msgitem.find(".accept").removeClass("accept");
                    $("#mCSB_2_container", "#show_msgs").append(msgitem);
                }
            });
            //注销掉数据库中此对话用户的所有未读消息
            $.ajax({
                type : "POST",
                url : "request/changeMsgStatus",
                data : {postUser : chatingId , getUser : userId},
                success : function (res) {}
            })
        }
        else {
            chatingId = null; //置空群聊存储id

            talkingId = $(this).attr("class");  //获取群聊窗口对话id
            talkingId = talkingId.replace(/talks /, "");
            talkingId = talkingId.replace(/ active/, "");

            title = $(this).find("h4").find("span").first().html();
            var membernum = talklist[talkingId].talkmember.length;
            $("h5.title",".col-3").html(title + "（" + membernum + "人）");
            var members = $(this).find(".talks-logo");
            $.each(talklist[talkingId+''].talkmsgs, function (index, val) {
                if(val.type == 0) {
                    var postuserinfo = members.children("." + val.postUser);
                    msgitem = $(".top", ".col-3").find(".msg-item").first().clone(true);
                    msgitem.attr("style", "display:block");
                    msgitem.addClass("left");           //添加左边消息样式
                    msgitem.find("img").attr("src", postuserinfo.attr("src"));
                    msgitem.find("h4").html(postuserinfo.attr("alt"));
                    msgitem.find(".text").find(".wrapper").html(val.content);
                    $("#mCSB_2_container", "#show_msgs").append(msgitem);
                }
                else if(val.type == 1) {
                    msgitem = $(".top", ".col-3").find(".system-msg").first().clone(true);
                    msgitem.attr("style", "display:block");
                    msgitem.find("span").html(val.content);
                    $("#mCSB_2_container", "#show_msgs").append(msgitem);
                }
                else if(val.type == 2) {
                    msgitem = $(".top", ".col-3").find(".msg-item").first().clone(true);
                    msgitem.attr("style", "display:block");
                    msgitem.addClass("right");           //添加右边消息样式
                    msgitem.find("img").attr("src", "img/" + userinfo.userlogo);
                    msgitem.find(".text").find(".wrapper").html(val.content);
                    $("#mCSB_2_container", "#show_msgs").append(msgitem);
                }

            });
            //注销掉数据库中此群聊所有未读消息
            $.ajax({
                type : "POST",
                url : "request/changeTalkRead",
                data : {talk : talkingId , user : userId},
                success : function (res) {}
            })
        }
        scrolltobottom();
    });

    //发送消息
    $(".send", ".bottom").bind("click", sendMsg);
    $("#msg_text").keypress(function (e) {
        if(e.which === 13){
            sendMsg();
            e.preventDefault();
        }
    });
    function sendMsg () {
        var msg = $("#msg_text").val();
        var data;
        if(!msg){ tipLayerout({content: "请输入消息", time:2000}) }
        else {
            $("#msg_text").val(""); //置空文本输入框
            var time = makeDate(new Date());
            //第二列消息列表同步显示
            if(chatingId) {
                data = {
                    getUser : chatingId,
                    content : msg
                };
                socket.emit("sendMsg", data);
                $(".msgs-ul").children("#" + chatingId).find("span.time").html(time);
                $(".msgs-ul").children("#" + chatingId).find("p").html(msg);
                chatlist[chatingId].datas.push({
                    content : msg,
                    time : time,
                    type : 2
                });
            }
            else {
                var member = talklist[talkingId].talkinfo.member.split(",");
                var userself = $.inArray(userId + "", member);
                member.splice(userself, 1);
                data = {
                    getUser : talkingId,
                    member : member,
                    content : msg
                };
                socket.emit("sendTalkMsg", data);
                $(".msgs-ul").children("." + talkingId).find("span.time").html(time);
                $(".msgs-ul").children("." + talkingId).find("p").html(msg);
                talklist[talkingId].talkmsgs.push({
                    content : msg,
                    time : time,
                    type : 2
                });
            }
            var msgitem = $(".top", ".col-3").find(".msg-item").first().clone(true);
            msgitem.attr("style", "display:block");
            msgitem.addClass("right");           //添加右边消息样式
            msgitem.find("img").attr("src", "img/" + userinfo.userlogo);
            msgitem.find(".text").find(".wrapper").html(msg);
            $("#mCSB_2_container", "#show_msgs").append(msgitem);

            scrolltobottom();
        }
    }

    //接受私人消息
    socket.on("Msg", function (data) {
        //消息发送者在当前消息列表内，但不是正在对话的用户
        if(chatlist[data.postUser] && chatingId != data.postUser) {
            chatlist[data.postUser].datas.push({
                content : data.content,
                time : data.time,
                type : data.type
            });
            //改变未读消息数
            unread ++;
            $(".msgs", ".col-1").html(unread);
            $("#bottom-nav").find("i").html(unread);
            $(".msgs-ul").find("#" + data.postUser).find("span.time").html(data.time);
            var msgunread = $(".msgs-ul").find("#" + data.postUser).children("span").html();
            if(msgunread) {
                msgunread = parseInt(msgunread) + 1;
            }
            else { msgunread = 1 }
            $(".msgs-ul").find("#" + data.postUser).children("span").html(msgunread);
            $(".msgs-ul").find("#" + data.postUser).children("span").attr("style", "display: block");
            if(data.type == 1) {
                $(".msgs-ul").find("#" + data.postUser).find("p").html(data.content + "请求添加好友");
            }
            else if(data.type == 0) {
                $(".msgs-ul").find("#" + data.postUser).find("p").html(data.content);
            }
        }

        //消息发送者在当前消息列表内，是正在对话的用户
        else if(chatlist[data.postUser] && chatingId == data.postUser) {
            chatlist[data.postUser].datas.push({
                content : data.content,
                time : data.time,
                type : data.type
            });

            $(".msgs-ul").find("#" + chatingId).find("span.time").html(data.time);
            var msgitem;
            if(data.type == 0){

                $(".msgs-ul").find("#" + chatingId).find("p").html(data.content);
                var title = $(".msgs-ul").find("#" + chatingId).find("h4").find("span").first().html();
                var img = $(".msgs-ul").find("#" + chatingId).children("img").attr("src");
                msgitem = $(".top", ".col-3").find(".msg-item").first().clone(true);
                msgitem.attr("style", "display:block");
                msgitem.addClass("left");           //添加左边消息样式
                msgitem.find("img").attr("src", img);
                msgitem.find("h4").html(title);
                msgitem.find(".text").find(".wrapper").html(data.content);
                $("#mCSB_2_container", "#show_msgs").append(msgitem);
            }
            else if(data.type == 1) {
                $(".msgs-ul").find("#" + chatingId).find("p").html(data.content + "请求添加您为好友");
                msgitem = $(".top", ".col-3").find(".add-friend-req").first().clone(true);
                msgitem.attr("style", "display:block");
                msgitem.find(".text").find(".post-user").html(data.content);
                $("#mCSB_2_container", "#show_msgs").append(msgitem);
            }
            $.ajax({
                type : "POST",
                url : "request/changeMsgStatus",
                data : {postUser : chatingId , getUser : userId},
                success : function (res) {}
            });
        }

        //消息发送者不在当前列表中
        else if(!chatlist[data.postUser]){
            if(data.postUser == 30) {
                chatlist["30"] = {
                    user : {
                        id : 30,
                        name : "系统消息",
                        userlogo : "system_logo.png"
                    },
                    datas : [{
                        content : data.content,
                        time : data.time,
                        type : data.type
                    }]
                };
                unread ++;
                $(".msgs", ".col-1").html(unread);
                $("#bottom-nav").find("i").html(unread);
                var li = $(".msgs-ul", ".col-2").find("li.singleMsg").first().clone(true);
                li.attr("style", "");
                li.children("span").html(1);
                li.children("span").attr("style", "display:block");
                li.find("img").attr("src", "img/system_logo.png");
                li.attr("id", "30");
                li.find("span.name").html("系统消息");
                li.find("span.time").html(data.time);
                if(data.type == 1) {
                    li.find("p").html(data.content + "请求添加您为朋友");
                }
                else {
                    li.find("p").html(data.content);
                }
                $(".msgs-ul",".col-2").append(li);
            }
            else {
                //先查询这个用户，并在消息列表中显示
                $.ajax({
                    type : "POST",
                    url : "request/addfriend",
                    data : {search : data.postUser },
                    success : function (res) {
                        chatlist[res.data.id + ''] = {
                            user : res.data,
                            datas : [{
                                content : data.content,
                                time : data.time,
                                type : data.type
                            }]
                        };
                        //改变未读消息数
                        unread ++;
                        $(".msgs", ".col-1").html(unread);
                        $("#bottom-nav").find("i").html(unread);
                        var li = $(".msgs-ul", ".col-2").find("li.singleMsg").first().clone(true);
                        li.attr("style", "");
                        li.children("span").html(1);
                        li.children("span").attr("style", "display:block");
                        li.find("img").attr("src", "img/" + res.data.userlogo);
                        li.attr("id", res.data.id);
                        li.find("span.name").html(res.data.name);
                        li.find("span.time").html(data.time);
                        li.find("p").html(data.content);
                        $(".msgs-ul",".col-2").append(li);
                    }
                });
            }
        }
        scrolltobottom();
    });

    //接收群聊消息
    socket.on("talks", function (data) {
        //消息发送者在当前消息列表内，但不是正在对话的用户
        if(talklist[data.talkid] && talkingId != data.talkid) {
            talklist[data.talkid].talkmsgs.push({
                postUser : data.postUser,
                content : data.content,
                time : data.time,
                type : data.type
            });
            //改变未读消息数
            unread ++;
            $(".msgs", ".col-1").html(unread);
            $("#bottom-nav").find("i").html(unread);
            $(".msgs-ul").children("." + data.talkid).find(".time").html(data.time);
            var msgunread = $(".msgs-ul").children("." + data.talkid).children("span").html();
            if(msgunread) {
                msgunread = parseInt(msgunread) + 1;
            }
            else { msgunread = 1 }
            $(".msgs-ul").children("." + data.talkid).children("span").html(msgunread);
            $(".msgs-ul").children("." + data.talkid).children("span").attr("style", "display: block");
            if(data.type == 1) {
                $(".msgs-ul").children("." + data.talkid).find("p").html("系统消息");
            }
            else if(data.type == 0) {
                $(".msgs-ul").children("." + data.talkid).find("p").html(data.content);
            }
        }

        //消息发送者在当前消息列表内，是正在对话的用户
        else if(talklist[data.talkid] && talkingId == data.talkid) {
            talklist[data.talkid].talkmsgs.push({
                postUser : data.postUser,
                content : data.content,
                time : data.time,
                type : data.type
            });
            $(".msgs-ul").children("." + talkingId).find("span.time").html(data.time);
            var msgitem;
            if(data.type == 0){
                $(".msgs-ul").children("." + talkingId).find("p").html(data.content);
                var title = $(".msgs-ul").children("." + talkingId).find("." + data.postUser).attr("alt");
                var img = $(".msgs-ul").children("." + talkingId).find("." + data.postUser).attr("src");
                msgitem = $(".top", ".col-3").find(".msg-item").first().clone(true);
                msgitem.attr("style", "display:block");
                msgitem.addClass("left");           //添加左边消息样式
                msgitem.find("img").attr("src", img);
                msgitem.find("h4").html(title);
                msgitem.find(".text").find(".wrapper").html(data.content);
                $("#mCSB_2_container", "#show_msgs").append(msgitem);
            }
            else if(data.type == 1) {
                $(".msgs-ul").children("." + talkingId).find("p").html("系统消息");
                msgitem = $(".top", ".col-3").find(".system-msg").first().clone(true);
                msgitem.attr("style", "display:block");
                msgitem.children("span").html(data.content);
                $("#mCSB_2_container", "#show_msgs").append(msgitem);
            }

            $.ajax({
                type : "POST",
                url : "request/changeTalkRead",
                data : {talk : talkingId , user : userId},
                success : function (res) {}
            });
        }

        //消息发送者不在当前列表中
        else if(!talklist[data.talkid]){
            unread ++;
            $(".msgs", ".col-1").html(unread);
            $("#bottom-nav").find("i").html(unread);
            //从朋友列表中取得数据
            var talklogo = $(".friends-ul", ".col-2").children("." + data.talkid).children(".talks-logo").clone(true);
            var members = talklogo.find("img");
            var member = [];
            $.each(members, function (index, val) {
                member.push($(val).attr("class"))
            });
            if($.inArray(userId + "", member) == -1) {
                member.push(userId + "");
            }
            member = member.join();
            var talkname = $(".friends-ul", ".col-2").children("." + data.talkid).find(".friend-name").html();
            var li = $(".msgs-ul", ".col-2").find("li.talks").first().clone(true);
            li.prepend(talklogo);
            li.addClass(data.talkid + "");
            li.attr("style", "");
            li.children("span").html(1);
            li.children("span").attr("style", "display:block");
            li.find("span.name").html(talkname);
            li.find("span.time").html(data.time);
            if(data.type == 1) {
                li.find("p").html("[系统消息]");
            }
            else {
                li.find("p").html(data.content);
            }
            $(".msgs-ul",".col-2").append(li);
            talklist[data.talkid] = {
                talkinfo : {
                    id : data.talkid,
                    member : member
                },
                talkmember : member.split(","),
                talkmsgs :[{
                    postUser : data.postUser,
                    content : data.content,
                    time : data.time,
                    type : data.type
                }]
            };
            console.log(talklist[data.talkid]);
        }
        scrolltobottom();
    });


    //接受好友请求事件
    $(".accept", ".add-friend-req").one('click', function () {
        var owner = $(this).parent().find(".post-user").html();
        socket.emit("changeFriendStatus", owner);
        $(this).addClass("forbidden");
        $(this).removeClass("accept");
        $(this).html("已接受");
        $(this).unbind("click");
        var index = $(this).parent().attr("class");
        index = parseInt(index);
        chatlist[chatingId].datas[index].type = 3;
    });

    //各种事件注销当前会话Id
    $(".friends", ".col-1").bind('click', function (e) {
        chatingId = null;
        talkingId = null;
        $(".chat","#main_Hoo").hide();
        $(".show","#main_Hoo").show();
        $(".show","#main_Hoo").find(".welcome").show();
        $(".show","#main_Hoo").find(".friendinfo").hide();
        $(".active", ".msgs-ul").removeClass("active");
    });

    //显示好友信息
    $(".friends-ul",".col-2").delegate(".friend",'click', function () {
        $("#main_Hoo").children(".chat").hide();
        $("#main_Hoo").children(".show").show();
        $("#main_Hoo").children(".show").find(".welcome").hide();
        $("#main_Hoo").children(".show").find(".talkinfo").hide();
        $("#main_Hoo").children(".show").find(".log-out").hide();
        var friendinfo = $("#main_Hoo").children(".show").find(".friendinfo");
        friendinfo.find("img").attr("src", $(this).find("img").attr("src"));
        friendinfo.find("img").attr("alt", $(this).find("img").attr("alt"));
        friendinfo.find("span").html($(this).find(".friend-name").html());
        friendinfo.find("form").hide();
        friendinfo.children(".sendmsg").show();
        friendinfo.show();
    });

    //显示群聊信息
    $(".friends-ul",".col-2").delegate(".talks",'click', function () {
        var talksid;
        $("#main_Hoo").children(".chat").hide();
        $("#main_Hoo").children(".show").show();
        $("#main_Hoo").children(".show").find(".welcome").hide();
        $("#main_Hoo").children(".show").find(".friendinfo").hide();
        talksid = $(this).attr("class");  //获取群聊窗口对话id
        talksid = talksid.replace(/talks /, "");
        talksid = talksid.replace(/ active/, "");
        var talkinfo = $("#main_Hoo").children(".show").find(".talkinfo");
        talkinfo.find(".tobeclear").remove();
        talkinfo.attr("class", "talkinfo " + talksid);
        var info = $(this).children(".talks-logo").find("img");
        $.each(info, function (index, val) {
            var item = talkinfo.find(".item").first().clone(true);
            item.addClass("tobeclear");
            item.attr("style", "");
            item.find("img").attr("src", $(val).attr("src"));
            item.find("h4").html($(val).attr("alt"));
            talkinfo.append(item);
        });
        talkinfo.show();
    });

    //进入私人聊天
    $("#main_Hoo").children(".show").find(".friendinfo").children(".sendmsg").bind('click', function () {
        //第一列
        $(".msgs",".col-1").addClass("active");
        $(".friends",".col-1").removeClass("active");
        //第二列
        $(".friends-ul",".col-2").hide();
        $(".msgs-ul",".col-2").show();
        //将选中用户加入聊天列表
        var id = $(this).parent().find("img").attr("alt");
        var name = $(this).parent().find("span").html();
        var img = $(this).parent().find("img").attr("src");
        chatingId = id;
        if(!chatlist[id]) {
            chatlist[id] = {
                user : {
                    id : id,
                    name : name,
                    userlogo : img
                },
                datas : []
            };
            var li = $(".msgs-ul", ".col-2").find("li.singleMsg").first().clone(true);
            li.attr("style", "");
            li.find("img").attr("src", img);
            li.attr("id", id);
            li.find("span.name").html(name);
            li.find("span.time").html(makeDate(new Date()));
            $(".msgs-ul",".col-2").append(li);
        }
        $(".chat","#main_Hoo").show();
        $(".show","#main_Hoo").hide();
        $("#main_Hoo").children(".show").find(".friendinfo").hide();
        $(".active",".col-2").removeClass("active");
        $("#" + id).addClass("active");
        var title = $("#" + id).find("h4").find("span").first().html();
        $("#mCSB_2_container", "#show_msgs").html("");    //清空上一个对话消息
        $("#msg_text").html("");    //清空输入框内容
        $("h5.title",".col-3").html(title);
    });

    //进入群聊
    $("#main_Hoo").children(".show").find(".talkinfo").children("div").bind('click', function () {
        var talksid;
        //第一列
        $(".msgs",".col-1").addClass("active");
        $(".friends",".col-1").removeClass("active");
        //第二列
        $(".friends-ul",".col-2").hide();
        $(".msgs-ul",".col-2").show();
        //从朋友列表中取得数据
        talksid = $(this).parent().attr("class");  //获取群聊窗口对话id
        talksid = talksid.replace(/talkinfo /, "");
        if(!talklist[talksid]) {
            var talklogo = $(".friends-ul", ".col-2").children("." + talksid).children(".talks-logo").clone(true);
            var members = talklogo.find("img");
            var member = [];
            var memberlength;
            $.each(members, function (index, val) {
                member.push($(val).attr("class"))
            });
            if($.inArray(userId + "", member) == -1) {
                member.push(userId)
            }
            memberlength = member.length;
            member = member.join();
            var talkname = $(".friends-ul", ".col-2").children("." + talksid).find(".friend-name").html();
            var li = $(".msgs-ul", ".col-2").find("li.talks").first().clone(true);
            li.prepend(talklogo);
            li.addClass(talksid + "");
            li.attr("style", "");
            li.find("span.name").html(talkname);
            $(".msgs-ul",".col-2").append(li);
            talklist[talksid] = {
                talkinfo : {
                    id : talksid,
                    member : member
                },
                talkmember : member.split(","),
                talkmsgs :[]
            };
        }
        $(".chat","#main_Hoo").show();
        $(".show","#main_Hoo").hide();
        $(".active",".col-2").removeClass("active");
        $("." + talksid).addClass("active");
        var title = $("." + talksid).find("h4").find("span").first().html();
        title = title + "（" + talklist[talksid].talkmember.length + "人）";
        $("#mCSB_2_container", "#show_msgs").html("");    //清空上一个对话消息
        $("#msg_text").html("");    //清空输入框内容
        $("h5.title",".col-3").html(title);
        $("#main_Hoo").children(".show").find(".talkinfo").hide();
        talkingId = talksid; //将当前对话列表设为此群聊id;
        chatingId = null; //将当前对话列表设为此群聊id;
    });

    //设置选项弹窗
    $(".setting", ".col-1").bind("click", function () {
        $("#main_Hoo").children(".chat").hide();
        $("#main_Hoo").children(".show").show();
        $("#main_Hoo").children(".show").find(".log-out").show();
        $("#main_Hoo").children(".show").find(".welcome").hide();
        var friendinfo = $("#main_Hoo").children(".show").find(".friendinfo");
        friendinfo.find("img").attr("src", "img/" + userinfo.userlogo);
        friendinfo.find("span").html(userinfo.name);
        friendinfo.children(".sendmsg").attr("style", "display: none");
        friendinfo.children("form").attr("style", "display: block");
        friendinfo.children("form").find("input[type='text']").attr("value", userinfo.id);
        friendinfo.show();
    });
    //上传头像
    $("#main_Hoo").children(".show").find(".friendinfo").find(".submit").bind('click', function () {
        $.ajax({
            url: '/request/uploadLogo',
            type: 'POST',
            cache: false,
            data: new FormData($('#changeLogo')[0]),
            processData: false,
            contentType: false
        }).done(function(res) {
            if(res.errorCode == 1) {
                $(".show", "#main_Hoo").find(".friendinfo").find("img").attr("src", "img/" + res.userlogo);
                $(".col-1", "#main_Hoo").find(".user-logo").find("img").attr("src", "img/" + res.userlogo);
                userinfo.userlogo = res.userlogo;
                tipLayerout({content:res.msg, time:2000})
            }
        })
    });

    //加入群聊
    $(".submit-talks", "#add_talks").find("span").bind("click", function () {
        var memberlist = [];
        var talksname = $(this).parent().children("input").val();
        if(!talksname) { tipLayerout({content : "请输入群聊名称", time : 2000}) }
        else {
            var list = $(".result-list", "#add_talks").find("#mCSB_4_container").find("li");
            $.each(list, function (index, val) {
                memberlist.push($(val).find("img").attr("alt"));
            });
            //关闭并重置添加群聊窗口
            $("#add_talks").hide();
            $(".choose-list","#add_talks").find("#mCSB_3_container").empty();
            $(".result-list","#add_talks").find("#mCSB_4_container").empty();
            $(".submit-talks", "#add_talks").attr("style", "display: none");
            socket.emit("addTalks", { members : memberlist, name : talksname});
        }
    });

    //添加群聊后在朋友列表及消息列表显示
    socket.on('addtalk', function (data) {
        for(var i = 0; i < data.memberinfo.length; i++) {
            if(data.memberinfo[i].id == userId) {
                data.memberinfo.splice(i, 1);
            }
        }
        var length = data.memberinfo.length;
        var item = $(".friends-ul", ".col-2").find(".talks").first().clone();
        if(length == 2) {
            $.each(data.memberinfo, function (index, val) {
                var img = $(".user-logo", ".col-1").children("img").clone();
                img.attr("src", "img/" + val.userlogo);
                img.attr("class", val.id);
                img.attr("alt", val.name);
                item.children(".talks-logo").append(img);
            });
            item.children(".talks-logo").addClass("twoman");
        }
        else if(length == 3) {
            $.each(data.memberinfo, function (index, val) {
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
            $.each(data.memberinfo, function (index, val) {
                var img = $(".user-logo", ".col-1").children("img").clone();
                img.attr("src", "img/" + val.userlogo);
                img.attr("class", val.id);
                img.attr("alt", val.name);
                item.children(".talks-logo").append(img);
            });
            item.children(".talks-logo").addClass("threeman");
        }
        else if(length >8) {
            $.each(data.memberinfo, function (index, val) {
                var img = $(".user-logo", ".col-1").children("img").clone();
                img.attr("src", "img/" + val.userlogo);
                img.attr("class", val.id);
                img.attr("alt", val.name);
                item.children("div").append(img);
            });
            item.children(".talks-logo").addClass("nineman");
        }
        item.children(".friend-name").html(data.talkname);
        item.attr("style", "display: block");
        item.addClass(data.talkid + "");
        $(".friends-ul", ".col-2").children(".talks").first().after(item[0]);
    })
    //退出登录
    $(".show", "#main_Hoo").find(".log-out").bind('click', function () {
        window.location.reload(); //这里就直接简单处理进行页面刷新表示断开连接
    });

    //最小化显示未读消息数
    $(".upBigBg","#bigBg").bind("click", function () {
        talkingId = null;
        chatingId = null;
        if(unread != 0) {
            $("#bottom-nav").find("i").html(unread);
        }
        $(".chat","#main_Hoo").hide();
        $(".show","#main_Hoo").show();
        $(".show","#main_Hoo").find(".welcome").show();
        $(".show","#main_Hoo").find(".friendinfo").hide();
        $(".active", ".msgs-ul").removeClass("active");
    })

}

function scrolltobottom () {
    $("#show_msgs").mCustomScrollbar("scrollTo", "bottom", {
        scollEasing : "easeOut"
    });
}

