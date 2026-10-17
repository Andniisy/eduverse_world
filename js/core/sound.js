/**
 * EDUVERSE - Web Audio Engine (Procedural Background Music & SFX)
 * Generates chill cosmic background music and game SFX using Web Audio API.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isPlayingBGM = false;
    this.timerId = null;
    this.step = 0;

    // Chord progression for ambient cosmic study theme (Cmaj7 -> Am7 -> Fmaj7 -> G7)
    this.chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
      [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [196.00, 246.94, 293.66, 349.23]  // G7 (G3, B3, D4, F4)
    ];
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Background Music Gain Node
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.15; // Soft ambient level
      this.bgmGain.connect(this.ctx.destination);

      // SFX Gain Node
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.3;
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleBGM() {
    this.initCtx();
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }

    return !this.isMuted;
  }

  startBGM() {
    if (this.isPlayingBGM) return;
    this.isPlayingBGM = true;
    this.step = 0;

    const playNextNote = () => {
      if (!this.isPlayingBGM || this.isMuted) return;

      const chordIndex = Math.floor(this.step / 4) % this.chords.length;
      const noteIndex = this.step % 4;
      const freq = this.chords[chordIndex][noteIndex];

      this.playSynthNote(freq, 1.2, 'sine');
      this.step++;

      this.timerId = setTimeout(playNextNote, 600); // Chill slow tempo
    };

    playNextNote();
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  playSynthNote(freq, duration, type = 'sine') {
    if (!this.ctx || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Envelope: Soft attack and smooth decay
      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0.01, now);
      noteGain.gain.linearRampToValueAtTime(0.08, now + 0.2);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('[SoundEngine] Note play failed:', e);
    }
  }

  playClick() {
    this.initCtx();
    if (this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playSuccess() {
    this.initCtx();
    if (this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 Arpeggio
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.3);
      }, idx * 90);
    });
  }

  playError() {
    this.initCtx();
    if (this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playCoin() {
    this.initCtx();
    if (this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // Note B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // Note E6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playLevelUp() {
    this.initCtx();
    if (this.isMuted) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // Arpeggio C Major C4-G5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.4);
      }, idx * 70);
    });
  }
}

export const sound = new SoundEngine();