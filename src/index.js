//get the HTTP module and create a server. This time we will store the returned server as "app"
//var http = require('http');
//grab socketio and pass in our server "app" to create a new socketio server running inside of our HTTP server
//Socket.io can also run individually, but in this case we want it to run with our webpages, so we will use the module's
//option to allow us to embed it
var socketio = require('socket.io');
//grab our file system 
var fs = require('fs');

var port = process.env.PORT || process.env.NODE_PORT || 3000;
var express = require('express');
var app = express();
var server = require('http').Server(app);
//var app = express();
//app.createServer();
var io = socketio(server);
server.listen(port);
var path = require('path');



//var index = fs.readFileSync(__dirname + '/../client/client.html');
//Our HTTP server handler. Remember with an HTTP server, we always receive the request and response objects
//function onRequest (request, response) {
//  //read our file ASYNCHRONOUSLY from the file system. This is much lower performance, but allows us to reload the page
//  //changes during development. 
//  //First parameter is the file to read, second is the callback to run when it's read ASYNCHRONOUSLY
//    if (request.url === "/scripts/test.js") {
//        
//    } else {    
//        response.writeHead(200, {"Content-Type": "text/html"});
//        response.write(index);
//        response.end();
//    }
//}

//var app = http.createServer(onRequest);
//tell server to listen on the port
//app.listen(port);

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname  + '/../client/client.html'));
});
app.use('/scripts', express.static(__dirname + '/../scripts'));
//app.listen(port, function () {
//    console.log("Started Express server listening on port" + port);
//});





var users = {};

//Overall object to show maintained by the server
/**Clients will have their own local objects, but the one on the server will be 
   assumed to be the master object. This is the correct up to date one. All others are just synced
   from this one. **/
var score = 0;

var onJoined = function (socket) {
    socket.on('join', function (data) {
    var joinMsg = {
     name: 'server',
     msg: 'There are ' + Object.keys(users).length + ' users online'
     };
        console.log("joining");
console.log(data);
    socket.emit('msg', joinMsg);
    socket.name = data.name;
    socket.join('room1');
    socket.broadcast.to('room1').emit('msg', {
        name: 'server',
        msg: data.name + " has joined the room."
    });
    socket.emit('msg', {
        name: 'server',
        msg: 'You joined the room'
    });
});

};

var onMsg = function (socket) {
    socket.on('msgToServer', function(data) {
        console.log("Message receieved: " + data.msg);
        io.sockets.in('room1').emit('msg', {
            name: socket.name,
            msg: data.msg
        });
    });
};

var onDisconnect = function (socket) {
    
};


/** Now we need to code our web sockets server. We are using the socket.io module to help with this. 
    This server is a SEPARATE server from our HTTP server. They are TWO DIFFERENT SERVERS. 
    That said, socket.io allows us to embed our websockets server INSIDE of our HTTP server. That will allow us to
    host the socket.io libraries on the client side as well as handle the websocket port automatically. 
**/
//When new connections occur on our socket.io server (we receive the new connection as a socket in the parameters)
io.sockets.on('connection', function (socket) {
    console.log("RECEIVED NEW CONNECTION");
    onJoined(socket);
    onMsg(socket);
    onDisconnect(socket);
});

//console.log("Started websocket chat server.");