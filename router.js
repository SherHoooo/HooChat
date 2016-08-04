var fs = require("fs");
var path = require("path");
var mime = require("./mime").types;
var requestHandlers = require("./requestHandlers");

//cookie设置
function serialize (name, val, opt) {
	var pairs = [name + '=' + val];
	opt = opt || {};
	if(opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
	if(opt.domain) pairs.push('Domain=' + opt.domian);
	if(opt.path) pairs.push('Path=' + opt.path);
	if(opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
	if(opt.httpOnly) pairs.push('httpOnly');
	if(opt.secure) pairs.push('Secure');

	return pairs.join(';');
}

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
			response.setHeader('Set-Cookie', serialize('inline', '0'));
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
