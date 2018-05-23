
const ip = "127.0.0.1", port = 5678, http = require('http');

function onRequest(request, response) {
		  console.log("Request received.");
		  response.writeHead(200, {"Content-Type": "text/html; charset=utf8"});
		  response.write("<html><body><h1>Hello World Hello World. This is my werbserver!</h1></body></html>");
		  response.end();
}
http.createServer(onRequest).listen(port, ip);
console.log("My server has started.");
