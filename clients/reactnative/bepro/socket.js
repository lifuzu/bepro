import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:3000/time');
function subscribeToTimer(cb) {
  socket.on('timer', timestamp => cb(null, timestamp));
  socket.emit('subscribeToTimer', 1000);
}

const wechat = openSocket('http://localhost:3000/wechat');
function scanToWechat(cb) {
  wechat.on('scan', url => cb(null, url));
}

export { subscribeToTimer, scanToWechat }