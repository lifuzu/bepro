
const tts = require('./voice-rss-tts/index');

tts.speech({
  key: '3f7e275b1a53446c89fe7c14a08495bb',
  hl: 'zh-cn',
  src: '不得了',
  r: 0,
  c: 'mp3',
  f: '44khz_16bit_stereo',
  ssml: false,
  b64: false,
  callback(error, content) {
    // response.end(error || content);
    console.log(content.toString('base64'));
  },
});

// STEPS:
// Run this file with `node test_tts.js > data/voice_base64.txt`;
// Transform to mp3 `base64 --decode data/voice_base64.txt > data/voice.mp3`;
// Play the mp3, you should hear "不得了" in Chinese.
