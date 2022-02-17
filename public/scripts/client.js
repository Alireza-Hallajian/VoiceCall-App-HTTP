const socket = io('/');
const audioBox = document.getElementById('audioBox');


let myPeer = null;
let peerConnectionId = null;

// create peer connection
function createPeer() 
{
	myPeer = new Peer(undefined, {
		host: '/',
		port: '3001'
	});
	
	myPeer.on('open', id => {
		peerConnectionId = id;
	});
}

createPeer();


const myAudioBox = document.createElement('audio')
myAudioBox.muted = true
let audioStream = null;;

// access to user's microphone 
navigator.mediaDevices.getUserMedia({
	// video: true,
	audio: true
}).then(stream => 
{
	audioStream = stream;

	// answer the call
	myPeer.on('call', call => 
	{
		call.answer(audioStream);
		const audioBox = document.createElement('audio');
		call.on('stream', userAudioStream => 
		{
			addAudioStream(audioBox, userAudioStream);
			changeBtnStatusToConnected();
		});
	});

});

socket.on("admin ended the call", userId => {
	if (peerConnectionId === userId) {
		alert("Admin ended the call ");
		endCall();
	}
});

socket.on("admin-disconnected", userId => {
	alert("Admin Disconnected");
	changeBtnStatusToDisconnected() 
});



// stream audio to audioBox
function addAudioStream(audio, stream) {
	audio.srcObject = stream;
	audio.addEventListener('loadedmetadata', () => {
		audio.play();
	})
	audioBox.append(audio);
}


// request a call to admins and go to queue
function requestCall() 
{
	let connectionStatus = document.getElementById("requestCallBtn").getAttribute("status");

	if (connectionStatus === "notConnected"  &&  peerConnectionId) 
	{
		let requestCallBtn = document.getElementById("requestCallBtn");
		let requestCallBtnContent = requestCallBtn.children[0];
		requestCallBtnContent.innerText = "Please Wait...";
		requestCallBtn.setAttribute("status", "waiting");

		requestCallBtn.setAttribute("class", "waiting");
		requestCallBtn.setAttribute("onmouseover", "document.getElementById('requestCallBtn').children[0].innerText='Cancel Call'; document.getElementById('requestCallBtn').children[0].style.left = '17%';");
		requestCallBtn.setAttribute("onmouseout", "document.getElementById('requestCallBtn').children[0].innerText='Please Wait...'; document.getElementById('requestCallBtn').children[0].style.left = '13%';");
		requestCallBtn.onclick = endCall;

		// enable loading
		let loadAnimation = document.getElementById("loading-animation");
		loadAnimation.style.display = "inline-block";

		socket.emit('join-room', ROOM_ID, peerConnectionId, USERNAME);
	}
}

// close the connection and change the buttons
function endCall() {
	socket.emit('user ended the call', ROOM_ID, peerConnectionId, USERNAME);
	changeBtnStatusToDisconnected();
}


function changeBtnStatusToConnected() 
{
	let requestCallBtn = document.getElementById("requestCallBtn");
	let requestCallBtnContent = requestCallBtn.children[0];

	requestCallBtnContent.innerText = "Connected";
	requestCallBtnContent.style.left = "18%"
	
	requestCallBtn.setAttribute("class", "clientConnected");
	requestCallBtn.setAttribute("status", "connected");
	requestCallBtn.setAttribute("onmouseover", "document.getElementById('requestCallBtn').children[0].innerText='Disconnect'; document.getElementById('requestCallBtn').children[0].style.left = '17%';");
	requestCallBtn.setAttribute("onmouseout", "document.getElementById('requestCallBtn').children[0].innerText='Connected'; document.getElementById('requestCallBtn').children[0].style.left = '13%';");
	requestCallBtn.onclick = endCall;

	// disable loading
	let loadAnimation = document.getElementById("loading-animation");
	loadAnimation.style.display = "none";

	let instance = new SiriWave({
		container: document.getElementById("audio-wave-box"),
		width: 100,
		height: 120,
		// style: 'ios9'
	});
	
	instance.setAmplitude(0.5);
	instance.start();
}

// change the connect button to 'Request Call'
function changeBtnStatusToDisconnected() 
{
	let requestCallBtn = document.getElementById("requestCallBtn");
	let requestCallBtnContent = requestCallBtn.children[0];

	requestCallBtnContent.innerText = "Request Call";
	requestCallBtnContent.style.left = "13%"
	requestCallBtn.setAttribute("class", "clientNotConnected");
	requestCallBtn.setAttribute("status", "notConnected");
	requestCallBtn.setAttribute("onclick", "requestCall()");
	requestCallBtn.removeAttribute("onmouseover");
	requestCallBtn.removeAttribute("onmouseout");

	// disable loading
	let loadAnimation = document.getElementById("loading-animation");
	loadAnimation.style.display = "none";

	let audioBox = document.getElementById("audioBox");
	audioBox.innerHTML = "";

	let audioWaveBox = document.getElementById("audio-wave-box");
	audioWaveBox.innerHTML = "";
}

	
