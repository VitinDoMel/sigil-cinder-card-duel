// Procedural Web Audio API sound effects for card deal, snap, catalysts, shields, and win/loss.

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  unlock() {
    if (this.muted) return;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, duration = 0.12, type = 'triangle', gainPeak = 0.08, slideTo = null) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playDeal() {
    this.playTone(320, 0.07, 'sine', 0.04, 540);
  }

  playSnap() {
    this.playTone(190, 0.09, 'triangle', 0.09, 110);
    setTimeout(() => this.playTone(520, 0.07, 'sine', 0.05, 680), 25);
  }

  playCycle() {
    this.playTone(440, 0.08, 'sine', 0.05, 290);
  }

  playStrike() {
    this.playTone(145, 0.18, 'sawtooth', 0.1, 62);
  }

  playWard() {
    this.playTone(392, 0.16, 'triangle', 0.07, 587);
  }

  playCatalyst() {
    this.playTone(523.25, 0.16, 'triangle', 0.08, 784);
    setTimeout(() => this.playTone(659.25, 0.2, 'sine', 0.07, 1046.5), 60);
  }

  playVictory() {
    const notes = [392, 493.88, 587.33, 783.99];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 0.28, 'triangle', 0.09), idx * 95);
    });
  }

  playDefeat() {
    const notes = [293.66, 261.63, 220, 164.81];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 0.3, 'sawtooth', 0.07), idx * 115);
    });
  }
}
