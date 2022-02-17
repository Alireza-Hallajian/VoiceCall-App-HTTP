const socket = io('/');
const audioBox = document.getElementById('audioBox');

const peers = {};
const usersQueue = [];
let adminId = null;

// create peer connection
const myPeer = new Peer(undefined, {
	host: '/',
	port: '3001'
});

myPeer.on('open', id => {
	adminId = id;
	socket.emit('join-room', ROOM_ID, id, USERNAME);
});


const myAudio = document.createElement('audio')
myAudio.muted = true

let audioStream = null;

// access to user's microphone 
navigator.mediaDevices.getUserMedia({
	// video: true,
	audio: true
}).then(stream => {
	audioStream = stream;
});

// add new users to the queue
socket.on('user-connected', (userId, username) => {
	usersQueue.push(userId);
	addUserToQueue(userId, username);
});

// remove the user from the queue, if another admin is on call with him/her
socket.on('Remove this user from your queue', (userId, adminId) => {
	removeUserFromQueue(userId);
});

// remove user from queues on disconnect
socket.on('user ended the call', (userId, username) => 
{
	// alert 'user end call' if the user was under call
	if (checkCallingUser(userId)) {
		alert(username + "  ended the call");
	}

	endCall(userId);
	removeUserFromQueue(userId);
});

// remove user from queues on disconnect
socket.on('user-disconnected', (userId, username) => 
{
	// alert 'user disconnect' if the user was under call
	if (checkCallingUser(userId)) {
		alert(username + " Disconnected");
	}

	removeUserFromQueue(userId);
});


function checkCallingUser(userId) 
{
	let userDiv = document.getElementById(userId);
	if (userDiv) {
		let userCallingStatus = userDiv.children[2].getAttribute("class");
		console.log(userCallingStatus);
		if (userCallingStatus === "connectedBtn") {
			return true;
		}

		else return false;
	}

	else return false;
}


// stream audio to audioBox
function addAudioStream(audio, stream) {
	audio.srcObject = stream
	audio.addEventListener('loadedmetadata', () => {
		audio.play();
	})
	audioBox.append(audio);
}


// add new user to the queue
function addUserToQueue(userId, username) 
{	
	// if the user does not exist in queue and is NOT admin
	if (username.search('admin-') === -1 && !document.getElementById(userId))
	{
		let waitingMessage = document.getElementById("waitingMessage");
		let waitingAnimation = document.getElementById("waitingAnimation");
		waitingMessage.style.display = 'none';
		waitingAnimation.style.display = 'none';

		let div = document.createElement('div');
		div.innerHTML = `<span>${username}</span>
		<span class="audioWaveAnimation"></span>
		<span class="connectBtn" onclick="callUser(this.parentElement.id)">Connect</span>`;
	
		div.setAttribute("id", `${userId}`);
		div.setAttribute("class", "user");
	
		let usersQueueDiv = document.getElementById("usersQueue");
		usersQueueDiv.appendChild(div);
	}
}


// remove the user from the queue
function removeUserFromQueue(userId) 
{
	// remove from the ui
	let userDiv = document.getElementById(userId);
	if (userDiv) userDiv.remove();

	// remove from the memory
	let userIdIndex = usersQueue.indexOf(userId);
	if (userIdIndex !== -1) {
		usersQueue.splice(userIdIndex, 1);
	}

	let usersQueueDiv = document.getElementById("usersQueue");
	let waitingAnimation = document.getElementById("waitingAnimation");

	// show waitingMessage if no user is in the queue
	if (usersQueueDiv.children.length === 2) {
		let waitingMessage = document.getElementById("waitingMessage");
		waitingMessage.style.display = 'block';
		waitingAnimation.style.display = 'inline-block';
	}
}

// change the 'connect' button mode (in front of user name in queue box)
function changeConnectBtn(status, userId) 
{
	if (status === "connected") 
	{
		let userDiv = document.getElementById(userId);
		let connectBtn = userDiv.querySelector(".connectBtn");

		connectBtn.setAttribute("onmouseover", "this.innerText='Disconnect'");
		connectBtn.setAttribute("onmouseout", "this.innerText='Connected'");
		connectBtn.setAttribute("onclick", "adminEndCall(this.parentElement.id)");
		connectBtn.setAttribute("class", "connectedBtn");
		connectBtn.innerText = "Connected";

		// add audio-wave-animation
		addAudioWaveAnimation(userId);
	}
}

// end call by admin
function adminEndCall(userId) {
	socket.emit("admin ended the call", ROOM_ID, userId);
	endCall(userId);
}

// remove user from the queue and close the connection
function endCall(userId) {
	let userQueueNum = usersQueue.indexOf(userId);
	if (userQueueNum !== -1) usersQueue.splice(userQueueNum, 1);
	if (peers[userId]) peers[userId].close();
	removeUserFromQueue(userId);
}


// call a specific user from included in the queue
function callUser(userId) 
{
	const call = myPeer.call(userId, audioStream);
	const audio = document.createElement('audio');
	peers[userId] = call;

	call.on('stream', userAudioStream => {
		addAudioStream(audio, userAudioStream);
		changeConnectBtn("connected", userId);

		// tell the other admins that this client is on call with an admin
		socket.emit('This user is being answered', ROOM_ID, userId, adminId);
	});

	// remove user from the queue and close the connection
	call.on('close', () => {
		audio.remove();
		let userQueueNum = usersQueue.indexOf(userId);
		if (userQueueNum !== -1) usersQueue.splice(userQueueNum, 1);
		removeUserFromQueue(userId);
	});
}


function addAudioWaveAnimation(userId)
{
	let userRow = document.getElementById(userId);
	let audioWaveBox = userRow.children[1];

	var instance = new SiriWave({
		container: audioWaveBox,
		width: 250,
		height: 40,
		style: 'ios9'
	});
	
	instance.setAmplitude(5);
	instance.start();
}