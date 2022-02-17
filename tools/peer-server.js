// node_modules
const ip = require('ip');
const PeerServer = require('peer').PeerServer;

// config file
const constants = require('../constants.json');


let peerServer = new PeerServer({
	port: constants.peerServerPort
});

peerServer.on('connection', function (id) {
	console.log('new connection with id: ', id.id);
});

peerServer.on('disconnect', function (id) {
	console.log('disconnect with id: ' + id.id);
});


console.log('peer server running on ' + ip.address() + ':' + constants.peerServerPort);
console.log("----------------------------------------------\n");



module.exports;