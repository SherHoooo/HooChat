var http = require("http");
var url = require("url");
var router = require("./router").router;
var socket = require("socket.io");
var startio = require("./socket").startio;
var port = 8000;

var server = http.createServer(function(request,response){
	var pathname = url.parse(request.url).pathname;
	router(pathname,request,response);
});

server.listen(port);
var io = socket(server);
startio(io);

console.log("Server running at :localhost://"+port);

