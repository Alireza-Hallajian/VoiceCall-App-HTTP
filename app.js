// node_modules
const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require('uuid');

// config file
const constants = require('./constants.json');

const serverPort = process.argv[2] || constants.serverPort;

// use EJS as Template-Engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.json());  // parse application/json
app.use(express.json({type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(express.urlencoded({ extended: true }));  // parse application/x-www-form-urlencoded


// create a random Room if not specified
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
});


// admin page
app.get('/admin/:username/:room', (req, res) => 
{
    return res.render('admin', {
        roomId: req.params.room,
        username: req.params.username
    });
});

// client page
app.get('/client/:username/:room', (req, res) => {
    return res.render('client', {
        roomId: req.params.room,
        username: req.params.username
    });
});


// mange WebSocket connection
io.on('connection', socket => 
{
    socket.on('join-room', (roomId, userId, username) => 
    {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId, username);

        socket.on("This user is being answered", (userRoomId, answeredUserId, adminId) => {
            socket.to(userRoomId).broadcast.emit("Remove this user from your queue", answeredUserId, adminId);
        });

        socket.on("admin ended the call", (endedRoomId, endedUserId) => {
            socket.to(endedRoomId).broadcast.emit("admin ended the call", endedUserId);
        });

        socket.on("user ended the call", (endedRoomId, endedUserId, username) => {
            socket.to(endedRoomId).broadcast.emit("user ended the call", endedUserId, username);
        });
        

        socket.on('disconnect', () => 
        {
            if (username.search("admin-") !== -1) {
                socket.to(roomId).broadcast.emit('admin-disconnected', userId);
            }

            else socket.to(roomId).broadcast.emit('user-disconnected', userId, username);
        });
    })
});


server.listen(serverPort);
console.log("Server started listening in port 3000"); 
require('./tools/peer-server.js');  // run peer server