
//右侧弹出层
function rightLayout(param){
    $("#right-layerout").attr("style","width:"+param.width);
    $("#right-layerout").click(function(){
        $("#right-layerout").attr("style","width:"+param.width);
        return false;
    });
    $(".title","#right-layerout").html(param.title);
    var body = $(param.content).clone(true);
    body.attr("style","display:block");
    $(".body","#right-layerout").html(body);
    return false;
}
function hideRightLayout(){
    $("#right-layerout").attr("style","width:0");
    $("input","#todolist").val("");
}

//提示弹出层
function tipLayerout(param){
    $("#tips-layerout").html(param.content);
    $("#tips-layerout").attr("style","display:inline-block;background:rgba(36,32,38,0.8);");
    setTimeout(function(){
        $("#tips-layerout").attr("style","display:none;background:rgba(36,32,38,0);");
    },param.time)
}

//处理消息日期
function makeDate (date) {
    var newDate = new Date(date);
    var dateNow = new Date();
    if(dateNow.getMonth()>newDate.getMonth()||dateNow.getDay()>newDate.getDay()) {
        var month = newDate.getMonth();
        var day = newDate.getDay();
        if(month < 10){ month = "0" + month}
        if(day < 10){ day = "0" + day}
        return month + "/" + day;
    }
    else{
        var hours = newDate.getHours();
        var minutes = newDate.getMinutes();
        if(hours < 10){ hours = "0" + hours}
        if(minutes < 10){ minutes = "0" + minutes}
        return hours + ":" + minutes;
    }
}