var fs = require("fs");
var path = require("path");
var mime = require("./mime").types;
var requestHandlers = require("./requestHandlers");

function router(pathname,request,response){
	if(pathname.substring(1,8)=="request"){
		var realrequest = pathname.substring(9);
		if(typeof requestHandlers[realrequest] === "function"){
			requestHandlers[realrequest](request,response);
		}
		else {
			response.writeHead(500,{"Content-Type":"text/plain"});
			response.write("服务器无响应");
			response.end();
		}
	}
	else{
		if(pathname=="/"||pathname.substring(0,6)=="/index"){
			pathname = "/index.html";
		}
		var realPath = "Hoo"+pathname;
		fs.exists(realPath,function(exists){
			if(!exists){
				response.writeHead(404,{"Content-Type":"text/plain"});
				response.write("404 not found");
				response.end();
			}
			else{
				fs.readFile(realPath,"binary",function(err,file){
					if(err){
						response.writeHead(500,{"Content-Type":"text/plain"});
						response.end(err);
					}		
					else{
						var ext = path.extname(realPath);
						ext = ext ? ext.slice(1):'unknown';
						var contentType = mime[ext]||"text/plain";
						response.writeHead(200,{"Content-Type":contentType});
						response.write(file,"binary");
						response.end();
					}
				})
			}
		})
	}
};
exports.router = router;
