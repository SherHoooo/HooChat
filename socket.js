var useDb = require('./db').useDb;
var async = require('async');

function makeTime (date) {
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

function startio(io){
	var inlineList = {};
	io.sockets.on('connection', function(socket){
		var Db = useDb('user');	
		var userid;

		//登录链接之后即获取用户Id
		socket.on('getUserId', function (data) {
			inlineList[data] = socket;
			userid = data;
		});

		//添加好友事件
		socket.on('addfriend', function (data) {
			Db.query('insert into friends(owner,friend) value(?,?)', [data.owner, data.friend], function (err){
				if(err) { throw err }
			})
			Db.query('insert into msgs(postUser, getUser, content, type) value(?,?,?,?)', [30, data.friend, data.ownername, 1], function (err) {
				if(err) { throw err }
			});
			if(inlineList[data.friend]){
				//发送系统消息
				var time = makeTime(new Date());
				var backData = {
					content : data.ownername,
					time : time,
					postUser : 30,
					type : 1
				};
				inlineList[data.friend].emit('Msg', backData);
			}
		})

		//发送消息事件
		socket.on('sendMsg', function (data) {
		　	//存储消息
			Db.query('insert into msgs(postUser, getUser, content) value(?,?,?)', [userid, data.getUser, data.content], function (err) {
				if(err) { throw err }
			});
			if(inlineList[data.getUser]){
				//发送私人消息
				var time = makeTime(new Date());
				var backData = {
					content : data.content,
					time : time,
					postUser : userid,
					type : 0
				};
				inlineList[data.getUser].emit('Msg', backData);
			}
		})

		//接受添加好友请求
		socket.on('changeFriendStatus', function (owner) {
			Db.query('select * from baseinfo where name=?', owner, function (err, rows) {
				if(err) {throw err}
				else {
					Db.query('update friends set status=1 where owner=? and friend=?', [rows[0].id, userid], function (err) {
						if(err) {throw err}
						else {
							Db.query('insert into msgs(postUser, getUser, content) value(?,?,?)', [userid, rows[0].id, '我们已经是朋友啦，聊点什么吧'], function (err) {
								if(err) { throw err }
							});
							var time = makeTime(new Date());
							var backData = {
								content : "我们已经是朋友啦，聊点什么吧",
								time : time,
								postUser : userid,
								type : 0
							};
							if(inlineList[rows[0].id + ""]) {
								inlineList[rows[0].id + ""].emit('Msg', backData);
							}
							backData.type = 2,
							backData.postUser = rows[0].id;
							socket.emit('Msg', backData);
						}
					})
				}
			})
		})

		//添加群聊
		socket.on('addTalks', function (data) {
			data.members.push(userid　+ "");
			var members = data.members.join();
			var memberinfo = [];
			Db.query('insert into talks(member, name) value(?,?)', [members, data.name], function (err, result) {
				if(err) { throw err }
				else {
					Db.query('insert into talkmsgs(postUser,getUser,content,type) value(?,?,?,?)', [30, result.insertId,"您已加入群聊",1], function (err, result) {
						if(err) { throw err }
					})
					async.map(data.members, function (item, callback) {
						Db.query('select * from baseinfo where id=?', item, function (err, rows) {
							if(err) { throw err }
							else {
								var newtalks = rows[0].talks + "," + result.insertId; 
								Db.query('update baseinfo set talks=? where id=?', [newtalks, item], function (err) {
									if(err) { throw err }
								});
								var info = {
									id : rows[0].id,
									name : rows[0].name,
									userlogo : rows[0].userlogo
								};
								callback(null, info);
							}
						})
					}, function (err, results) {
						if(err) { throw err }
						else {
							memberinfo = results;
							var backdata = {
								content : "您已加入群聊",
								time : makeTime(new Date()),
								postUser : 30,
								talkid : result.insertId,
								type : 1
							}
							var anotherdata = {
								memberinfo : memberinfo,
								talkid : result.insertId,
								talkname : data.name
							}
							console.log(anotherdata);
							for (var i=0;i < data.members.length; i++) {
								if(inlineList[data.members[i]]) {
									inlineList[data.members[i]].emit('addtalk', anotherdata);
									inlineList[data.members[i]].emit('talks', backdata);
								}
							}
						}
					});
					
				}
			});
		})

		//发送群聊消息
		socket.on('sendTalkMsg', function (data) {
			Db.query('insert into talkmsgs(postUser,getUser,content,type) value(?,?,?,?)', [userid, data.getUser, data.content, 0], function (err, result) {
				if(err) { throw err} 
			});
			var backdata = {
				content : data.content,
				time : makeTime(new Date()),
				postUser : userid,
				talkid : data.getUser,
				type : 0
			}
			for(var i=0;i < data.member.length; i++) {
				if(inlineList[data.member[i]]) {
					inlineList[data.member[i]].emit('talks', backdata);
				}
			}
		})

		//客户端断开连接
		socket.on('disconnect', function () {
			inlineList[userid] = null; //将用户从在线列表中删除
		})
	})
}




exports.startio = startio;
