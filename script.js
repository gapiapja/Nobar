const socket = io(); // koneksi ke signaling server
const input = document.getElementById('chatInput');
const chat = document.getElementById('chatMessages');
const voiceBtn = document.getElementById('voiceBtn');

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && input.value.trim()) {
    const msg = input.value;
    socket.emit('chat', msg);
    input.value = '';
  }
});

socket.on('chat', (msg) => {
  const p = document.createElement('p');
  p.textContent = msg;
  chat.appendChild(p);
});

// WebRTC Voice Chat
let localStream;
let pc;

voiceBtn.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  pc = new RTCPeerConnection();

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.onicecandidate = e => {
    if (e.candidate) socket.emit('ice', e.candidate);
  };

  pc.ontrack = e => {
    const audio = new Audio();
    audio.srcObject = e.streams[0];
    audio.play();
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('offer', offer);
};

socket.on('offer', async offer => {
  pc = new RTCPeerConnection();
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.onicecandidate = e => {
    if (e.candidate) socket.emit('ice', e.candidate);
  };

  pc.ontrack = e => {
    const audio = new Audio();
    audio.srcObject = e.streams[0];
    audio.play();
  };

  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('answer', answer);
});

socket.on('answer', answer => {
  pc.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice', candidate => {
  pc.addIceCandidate(new RTCIceCandidate(candidate));
});
