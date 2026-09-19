/**
 * audio.js —— 用 WebAudio 程序化合成音效，无需外部音频文件。
 * 首次用户交互后才能启动 AudioContext（浏览器策略）。
 */
const Sound = {
  ctx: null,
  enabled: true,

  init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) this.ctx = new AC();
    // 首次交互恢复
    const resume = () => { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); };
    window.addEventListener('keydown', resume);
    window.addEventListener('mousedown', resume);
  },

  _beep(freq, dur, type = 'square', vol = 0.12, slideTo = null) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + dur);
  },

  shoot()   { this._beep(720, 0.08, 'square', 0.08, 220); },
  shotgun() { this._beep(180, 0.16, 'sawtooth', 0.12, 60); },
  hit()     { this._beep(300, 0.06, 'square', 0.08, 500); },
  enemyDie(){ this._beep(160, 0.22, 'sawtooth', 0.12, 40); },
  hurt()    { this._beep(200, 0.25, 'triangle', 0.16, 70); },
  jump()    { this._beep(420, 0.12, 'sine', 0.08, 700); },
  pickup()  { this._beep(880, 0.12, 'sine', 0.12, 1320); },
  transform(){ this._beep(300, 0.2, 'sine', 0.14, 900); },
  win()     { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>this._beep(f,0.2,'triangle',0.14),i*130)); },
  lose()    { [400,300,200].forEach((f,i)=>setTimeout(()=>this._beep(f,0.3,'sawtooth',0.14),i*180)); },
};
