var useDb = require("./db").useDb;
var async = require("async");

//公用方法
function sendRes (data,response){
	response.writeHead(200,{"Content-Type":"application/json"});
	response.write(data);
	response.end();
}
function inArray (a, b) {
	var result = false;
	for(var i in a) {
		if(a[i] == b) { result = true }
	}
	return result;
}

//数据库操作
function insert(value,response){
	var useTest = useDb("user");
	var tasks = {
		selectName : function (callback) {
			useTest.query('select * from baseinfo where name=?', value[0], function (err, result) {
				if(result[0]) {
					callback(err, result[0]);
				}
				else {
					callback(err, null)
				}
			});
		},
		selectMobile : function (callback) {
			useTest.query('select * from baseinfo where mobile=?', value[2], function (err, result) {
				if(result[0]) {
					callback(err, result[0]);
				}
				else {
					callback(err, null)
				}
			});
		}
	};
	async.series(tasks, function(err, results) {
		if(err) {
			throw err;	
		}
		else if(results.selectName != null) {
			result = {errorCode : 0, msg : "用户名已存在"};
			result = JSON.stringify(result);
			sendRes(result,response);
		}
		else if(results.selectMobile != null) {
			result = {errorCode : 2, msg : "手机号已存在"};
			result = JSON.stringify(result);
			sendRes(result,response);
		}
		else {
			useTest.query('insert into baseinfo(name,pwd,mobile) value(?,?,?)',value,function (err,results) {
				if(err) {throw err}
				else {
					result = {
						errorCode : 1, 
						msg : '注册成功', 
						userinfo : {
							id : results.insertId,
							userlogo : 'defaultUserlogo.png',
							name : value[0],
							email : value[2]
						}
					};
					result = JSON.stringify(result);
					sendRes(result,response);
				}
			})
			useTest.end();
		}
	});
}
		
function selectAll(database,table,response){
	var useTest = useDb(database);
	var result = null;
	useTest.query('select * from '+table,function(err,rows){
		if(err) throw err;
		else{
			var total = 0;
			var datas = [];
			for(var i in rows){
				datas.push({
					done:rows[i].done,
					content:rows[i].content,
					listId:rows[i].id
				});
				total++;
			}
			result = {total:total,datas:datas};
			result = JSON.stringify(result);
			sendRes(result,response);
		}
	});
	useTest.end();
}
function update(database,table,name,value,key,response){
	var useTest = useDb(database);
	var result = null;
	useTest.query('update '+table+' set '+name+'='+value+' where '+key.name+' = '+key.value,function(err){
		if(err)throw err;
		else{
			result = {errorCode:1,msg:"操作成功"};
			result = JSON.stringify(result);
			sendRes(result,response);
		}
	});
	useTest.end();
}
function deleteAll(database,table,name,value,response){
	var useTest = useDb(database);
	var result = null;
	useTest.query('delete from '+table+' where '+name+'='+value,function(err){
		if(err) throw err;
		else{
			result = {errorCode:1,msg:"操作成功"};
			result = JSON.stringify(result);
			sendRes(result,response);
		}
	});
	useTest.end();
}
function select(database,table,name,value,checkValue,response){
	var useTest = useDb(database);
	var result = null;
	async.waterfall ([
		function (cb) {
			useTest.query('select * from '+table+' where '+name+'="'+value+'"',function(err,rows){
				if(err) { cb(err)}
				else{
					if(rows[0] == null){ result={errorCode:2, msg:"用户名不存在"}; cb("2", result)}
					else if(rows[0].pwd != checkValue){result = {errorCode:0, msg:"密码输入错误!"}; cb('0', result) }
					else { cb (null, rows[0]) }
				}
			})
		},
		function (userinfo, cb) {
			async.parallel([
				function (call) {
					async.waterfall ([
						function (callback) {
							useTest.query('select * from friends where status=1 and (owner=? or friend=?)',[userinfo.id, userinfo.id],function (err, rows) {
								if(err) { cb(err) }
								else {
									var friendsid = [];
									for(var i in rows) {
										if(rows[i].friend == userinfo.id) {
											friendsid.push(rows[i].owner);
										}
										else {
											friendsid.push(rows[i].friend)
										}
									}
									callback(null, friendsid);
								}
							})
						},
						function (friendsid, callback) {
							async.map(friendsid, function (item, back){
								useTest.query('select * from baseinfo where id=?', item, function (err, rows) {
									if(err) {back(err)}
									else {
										var data = {
											id : rows[0].id,
											name : rows[0].name,
											userlogo : rows[0].userlogo
										}
										back(null, data);
									}
								})
							}, function (err,results) {
								if(err) throw err;
								else {
									callback(null,results);
								}
							})
						}
					], function (err, result) {
						if(err) { call(err) }
						else {
							call(null, result);
						}
					})
				},
				function (call) {
					async.waterfall ([
						function (callback) {
							useTest.query('select * from msgs where getUser=? and status=0',userinfo.id,function (err, rows) {
								if(err) { callback(err) }
								else {
									var friends = [];
									for(var i in rows) {
										friends.push({
											postUser : rows[i].postUser,
											content : rows[i].content ,
											time : rows[i].time ,
											type : rows[i].type
										})
									}
									callback(null, friends);
								}
							})
						},
						function (friends, callback) {
							async.map(friends, function (item, back){
								useTest.query('select * from baseinfo where id=?', item.postUser, function (err, rows) {
									if(err) {back(err)}
									else {
										item.postUser = {
											id : rows[0].id,
											name : rows[0].name,
											userlogo : rows[0].userlogo
										};
										back(null,item);
									}
								})
							}, function (err, results) {
								if(err) throw err;
								else {
									callback(null, results);
								}
							})
						}
					], function (err, result) {
						if(err) { call(err) }
						else {
							call(null, result);
						}
					})	
				},
				function (call) {
					if(!userinfo.talks) {
						call(null,null)
					}
					else {
						var talks = userinfo.talks.split(",");
						talks.shift();
						async.map(talks, function (item, back) {
							async.parallel([
								function (callback) {
									async.waterfall([
										function (sendback) {
											useTest.query('select * from talks where id=?', item, function (err, rows) {
												if(err) {throw err}
												else {
													sendback(null, rows[0]) 
												}
											});
										},
										function (talkinfo, sendback) {
											var members = talkinfo.member.split(',');
											async.map(members, function (item,memberback) {
												useTest.query('select * from baseinfo where id=?', item, function (err, rows) {
													if(err) {
														throw err;
														memberback(err);
													}
													else {
														memberback(null, rows[0]);
													}
												})
											},function (err, results) {
												if(err) {
													throw err;
													sendback(err);
												}
												else {
													var data = {
														members : results,
														talkinfo : talkinfo
													}
													sendback(null, data);
												}
											})
										},
									], function (err, results) {
										if(err) { callback(err) }
										else { callback(null, results) }
									})
								},
								function (callback) {
									useTest.query('select * from talkmsgs where getUser=? and postUser != ?', [item, userinfo.id], function (err,rows) {
										var datas = [];
										for(var i in rows) {
											var readed = rows[i].readed;
											var data = {
												postUser : rows[i].postUser,
												content : rows[i].content,
												time : rows[i].time,
												type : rows[i].type
											}
											if(!readed) {
												datas.push(data);
											}
											else {
												readed = readed.split(",");
												if(!inArray(readed, userinfo.id + "")) {
													datas.push(data);
												}
											}
										}
										callback(null, datas)
									})
								}
							], function (err, result) {
								var data = {
									talkinfo : result[0].talkinfo,
									talkmember : result[0].members,
									talkmsgs : result[1] 
								};
								back(err, data);
							})
						}, function (err, results) {
							if(err) { throw err }
							else {
								call(null, results);
							}
						});
					}
				}
			], function (err, results) {
				if(err) { throw err}
				else cb(null, results, userinfo);
			})
		},
	],function (err, results, userinfo){
		if(err == '0' || err =='2') {
			result = results;
		}
		else {
			result = {
				userinfo : userinfo,
				friends : results[0],
				msgs : results[1],
				talks : results[2]
			}
		}
		result = JSON.stringify(result);
		sendRes(result, response);
		useTest.end();
	});
}

function selectfriend (post, response) {
	var Db = useDb('user');
	Db.query('select * from baseinfo where name=? or mobile=? or id=?',[post.search, post.search, post.search],function (err,rows) {
		if(err){ throw err;	}
		else if(rows[0] == null){
			var result = {errorCode : 0, msg : "此用户不存在，请重新查找"};
		}
		else {
			var result = {
				errorCode : 1,
				data : rows[0]
			}
		}
		result = JSON.stringify(result);
		sendRes(result, response);
	});
	Db.end();
}

function changeMsg (post, response) {
	var Db = useDb('user');
	Db.query('update msgs set status=1 where postUser=? and getUser=?', [post.postUser, post.getUser], function (err) {
		if(err) {throw err}
		else {
			var result = {
				errorCode : 1,
				msg : '修改成功'
			}
		}
		result = JSON.stringify(result);
		sendRes(result, response);
	});
	Db.end();	
}

function uploadLogo (userid, filename, response) {
	var Db = useDb('user');
	Db.query('update baseinfo set userlogo=? where id=?', [filename, userid], function (err) {
		if(err) {throw err}
		else {
			var result = {
				errorCode : 1,
				msg : '修改成功',
				userlogo : filename
			}
		}
		result = JSON.stringify(result);
		sendRes(result, response);
	});
	Db.end();	
}

function changeTalkRead (post, response) {
	var Db = useDb('user');
	Db.query('select * from talkmsgs where getUser=?', post.talk, function (err, rows) {
		if(err) { throw err }
		else {
			for(var i in rows) {
				var readed = rows[i].readed;
				var newRead;
				if(readed) {
					var readedArray = readed.split(',');
					if(!inArray(readedArray, post.user + "")) {
						newRead = rows[i].readed + "," + post.user;
						Db.query('update talkmsgs set readed=? where id=?', [newRead, rows[i].id], function (err) {
							var result = {};
							if(err) { 
								throw err ;
							}
						});
					}
				}
				else {
					newRead = post.user;
					Db.query('update talkmsgs set readed=? where id=?', [newRead, rows[i].id], function (err) {
						var result = {};
						if(err) { 
							throw err ;
						}
					});
				}
			}
			var result = {
				errorCode : 1,
				msg : '修改成功'
			}
			result = JSON.stringify(result);
			sendRes(result, response);
			Db.end();	
		}
	})
}

function searchTalk (post, response) {
	var Db = useDb('user');
	async.waterfall([
		function (sendback) {
			Db.query('select * from talks where id=?', post.search, function (err, rows) {
				if(err) {throw err}
				else {
					sendback(null, rows[0]) 
				}
			});
		},
		function (talkinfo, sendback) {
			var members = talkinfo.member.split(',');
			async.map(members, function (item,memberback) {
				Db.query('select * from baseinfo where id=?', item, function (err, rows) {
					if(err) {
						throw err;
						memberback(err);
					}
					else {
						memberback(null, rows[0]);
					}
				})
			},function (err, results) {
				if(err) {
					throw err;
					sendback(err);
				}
				else {
					var data = {
						members : results,
						talkinfo : talkinfo
					}
					sendback(null, data);
				}
			})
		},
	], function (err, results) {
		if(err) { throw err }
		else { 
			results = JSON.stringify(results);
			sendRes(result, response);
		}
	});
	Db.end();
}

function signUpName (post, response) {
	var Db = useDb('user');
	Db.query('select * from baseinfo where name = ?', post.name, function (err, rows) {
		var result = null;
		if(rows[0]) {
			result = {
				errorCode : 0
			}
		}
		else {
			result = {
				errorCode : 1 
			}
		}
		result = JSON.stringify(result);
		sendRes(result, response);
	})
}
function signUpMobile (post, response) {
	var Db = useDb('user');
	Db.query('select * from baseinfo where mobile = ?', post.mobile, function (err, rows) {
		var result = null;
		if(rows[0]) {
			result = {
				errorCode : 0
			}
		}
		else {
			result = {
				errorCode : 1 
			}
		}
		result = JSON.stringify(result);
		sendRes(result, response);
	})
}
exports.insert = insert;
exports.selectAll = selectAll;
exports.update = update;
exports.deleteAll = deleteAll;
exports.select = select;
exports.selectfriend = selectfriend;
exports.changeMsg = changeMsg;
exports.uploadLogo = uploadLogo;
exports.changeTalkRead = changeTalkRead;
exports.signUpName = signUpName;
exports.signUpMobile = signUpMobile;
