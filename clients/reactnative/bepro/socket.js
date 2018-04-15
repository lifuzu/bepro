import openSocket from 'socket.io-client';
import { Platform } from 'react-native';

const API_HOST = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2'

const  socket = openSocket('http://' + API_HOST + ':3000/time');
function subscribeToTimer(cb) {
  socket.on('timer', timestamp => cb(null, timestamp));
  socket.emit('subscribeToTimer', 1000);
}

const wechat = openSocket('http://' + API_HOST + ':3000/wechat');
function scanToWechat(cb) {
  wechat.on('scan', url => cb(null, url));
}

export { subscribeToTimer, scanToWechat }