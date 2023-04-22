var http = require('http'),
	WebSocket = require('ws');

module.exports = { 
	startWebsocketRelay: ({
		streamSecret,
		streamPort = 8081,
		websocketPort = 8082,
	}) => {	
		return new Promise((resolve, reject) => {
			// Websocket Server
			const socketServer = new WebSocket.Server({port: websocketPort, perMessageDeflate: false});
			socketServer.connectionCount = 0;
			socketServer.on('connection', function(socket, upgradeReq) {
				socketServer.connectionCount++;
				console.log(
					'New WebSocket Connection: ',
					(upgradeReq || socket.upgradeReq).socket.remoteAddress,
					(upgradeReq || socket.upgradeReq).headers['user-agent'],
					'('+socketServer.connectionCount+' total)'
				);
				socket.on('close', function(code, message){
					socketServer.connectionCount--;
					console.log(
						'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
					);
				});
			});
			socketServer.broadcast = function(data) {
				socketServer.clients.forEach(function each(client) {
					if (client.readyState === WebSocket.OPEN) {
						client.send(data);
					}
				});
			};
			
			// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
			const streamServer = http.createServer( function(request, response) {
				var params = request.url.substr(1).split('/');
			
				if (params[0] !== streamSecret) {
					console.log(
						'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
						request.socket.remotePort + ' - wrong secret.'
					);
					response.end();
				}
			
				response.connection.setTimeout(0);
				console.log(
					'Stream Connected: ' +
					request.socket.remoteAddress + ':' +
					request.socket.remotePort
				);
				request.on('data', function(data){
					socketServer.broadcast(data);
					if (request.socket.recording) {
						request.socket.recording.write(data);
					}
				});
				request.on('end',function(){
					console.log('close');
					if (request.socket.recording) {
						request.socket.recording.close();
					}
				});
			})
			// Keep the socket open for streaming
			streamServer.headersTimeout = 0;

			streamServer.on("listening", function() {
				console.log('Listening for incoming MPEG-TS Stream on http://127.0.0.1:'+streamPort+'/<secret>');
				console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+websocketPort+'/');
				resolve({close: () => {
					socketServer.close();
					streamServer.close();
				}});
			});

			streamServer.listen(streamPort);
		});
	}
};

