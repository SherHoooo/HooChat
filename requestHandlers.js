var querystring = require('querystring');
var util = require("util");
var async = require("async");
var fs = require("fs");
var formidable = require("formidable");
var mysql = require("./mysql");

function submitTodolist(request,response){
	var post = '';
	request.on('data',function(chunk){
		post +=chunk;
	});
	request.on('end',function(){
		post = querystring.parse(post);
		mysql.insertTodolist([post.content,"0"],response);	
	});
};
function getTodolist(request,response){
	var post = '';
	request.on('data',function(chunk){
		post +=chunk;
	});
	request.on('end',function(){
		post = querystring.parse(post);
		mysql.selectAll("desktop","todolist",response);
	})
}
function doneTodolist(request,response){
	var post = '';
	request.on('data',function(chunk){
		post +=chunk;
	});
	request.on('end',function(){
		post = querystring.parse(post);
		mysql.update("desktop","todolist","done","1",{name:"id",value:post.id},response);
	})
}
function deleteAllTodolist(request,response){
	mysql.deleteAll("desktop","todolist","done","1",response);
}
function signUp(request,response){
	var post = '';
	request.on('data',function(chunk){
		post +=chunk;
	});
	request.on('end',function(){
		post = querystring.parse(post);
		mysql.insert([post.name,post.pwd,post.mobile], response);
	})
}
function logIn(request,response){
	var post = '';
	request.on('data',function(chunk){
		post +=chunk;
	});
	request.on('end',function(){
		post = querystring.parse(post);
		mysql.select('user','baseinfo','name',post.name,post.pwd,response);
	})
}

function addfriend (request,response) {
	var post = '';
	request.on('data', function (chunk) {
		post += chunk;
	});
	request.on('end', function () {
		post = querystring.parse(post);
		mysql.selectfriend(post, response);
	})
}

function changeMsgStatus (request, response) {
	var post = '';
	request.on('data', function (chunk) {
		post += chunk;
	});
	request.on('end', function () {
		post = querystring.parse(post);
		mysql.changeMsg(post, response);
	})
}
function uploadLogo (request, response) {
	var form = new formidable.IncomingForm();
	form.parse(request, function (err, fields, files) {
		var types = files.upload.name.split('.');
		var timestamp = new Date().getTime();
		var filename = fields.userid + "" + timestamp + "." +types[types.length - 1] + "";
		fs.renameSync(files.upload.path, "/home/ubuntu/HooChat/Hoo/img/" + filename);
		mysql.uploadLogo(fields.userid, filename, response);
	})
}
function changeTalkRead (request, response) {
	var post = '';
	request.on('data', function (chunk) {
		post += chunk;
	});
	request.on('end', function () {
		post = querystring.parse(post);
		mysql.changeTalkRead(post, response);
	})
}

function searchTalk (request, response) {
	var post = '';
	request.on('data', function (chunk) {
		post += chunk;
	});
	request.on('end', function () {
		post = querystring.parse(post);
		mysql.searchTalk(post, response);
	})
}
function signUpName(request, response) {
	var post = '';
	request.on('data', function (chunk) {
		post += chunk;
	});
	request.on('end', function () {
		post = querystring.parse(post);
		mysql.signUpName(post, response);
	})
}
function signUpMobile(request, response) {
	var post = '';
	request.on('data', function (chunk) {
		post += chunk;
	});
	request.on('end', function () {
		post = querystring.parse(post);
		mysql.signUpMobile(post, response);
	})
}
exports.submitTodolist = submitTodolist;
exports.getTodolist = getTodolist;
exports.doneTodolist = doneTodolist;
exports.deleteAllTodolist = deleteAllTodolist;
exports.signUp = signUp;
exports.addfriend = addfriend;
exports.logIn = logIn;
exports.changeMsgStatus = changeMsgStatus;
exports.uploadLogo = uploadLogo;
exports.changeTalkRead = changeTalkRead;
exports.searchTalk = searchTalk;
exports.signUpName = signUpName;
exports.signUpMobile = signUpMobile;

