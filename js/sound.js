const Sound = {
  ctx: null,

  _ensureCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  _playTone(freq, type, duration, startGain = 0.3) {
    this._ensureCtx();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(startGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  },

  correct() {
    this._playTone(523.25, 'sine', 0.15, 0.25);
    setTimeout(() => this._playTone(659.25, 'sine', 0.15, 0.25), 100);
    setTimeout(() => this._playTone(783.99, 'sine', 0.3, 0.25), 200);
  },

  wrong() {
    this._playTone(200, 'sawtooth', 0.3, 0.15);
    setTimeout(() => this._playTone(150, 'sawtooth', 0.3, 0.15), 150);
  },

  combo() {
    this._playTone(880, 'sine', 0.1, 0.2);
    setTimeout(() => this._playTone(1108.73, 'sine', 0.1, 0.2), 80);
    setTimeout(() => this._playTone(1318.51, 'sine', 0.25, 0.2), 160);
  },

  click() {
    this._playTone(400, 'sine', 0.05, 0.1);
  },

  win() {
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 'sine', 0.3, 0.2), i * 120);
    });
  }
};
