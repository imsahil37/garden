import { state } from './state.js';

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.gainNode = null;
        this.ambientOscillators = [];
        this.initialized = false;

        state.on('audioToggle', (muted) => {
            if (this.ctx) {
                if (muted) {
                    this.ctx.suspend();
                } else {
                    this.ctx.resume();
                }
            }
        });

        state.on('orbHover', () => this.playSound('hover'));
        state.on('orbCollect', () => this.playSound('collect'));
        state.on('flowerBloom', () => this.playSound('bloom'));
        state.on('typeChar', () => this.playSound('type'));

        // Auto-initialize if already interacting? No, wait for explicit start.
    }

    init() {
        if (this.initialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 0.5;
        this.gainNode.connect(this.ctx.destination);

        this.startAmbient();
        this.initialized = true;
    }

    startAmbient() {
        // Simple ambient drone
        const frequencies = [220, 277, 330, 440]; // A major

        frequencies.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.frequency.value = freq;
            osc.type = 'sine';

            gain.gain.value = 0;

            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start();

            this.ambientOscillators.push({ osc, gain, baseFreq: freq });

            // Random volume modulation loop
            this.modulateVolume(gain);
        });
    }

    modulateVolume(gainNode) {
        if (state.isMuted) return;

        const duration = 2 + Math.random() * 4;
        const target = Math.random() * 0.05;

        gainNode.gain.linearRampToValueAtTime(target, this.ctx.currentTime + duration);

        setTimeout(() => this.modulateVolume(gainNode), duration * 1000);
    }

    playSound(type) {
        if (!this.initialized || state.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.gainNode);

        if (type === 'hover') {
            osc.frequency.setValueAtTime(600, now);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'collect') {
            // Chime
            [523, 659, 784].forEach((freq, i) => {
                const o = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                o.connect(g);
                g.connect(this.gainNode);
                o.frequency.value = freq;
                g.gain.setValueAtTime(0.1, now + i * 0.05);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + i * 0.05);
                o.start(now + i * 0.05);
                o.stop(now + 0.5 + i * 0.05);
            });
        } else if (type === 'bloom') {
             osc.frequency.setValueAtTime(440, now);
             gain.gain.setValueAtTime(0, now);
             gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
             gain.gain.linearRampToValueAtTime(0, now + 0.4);
             osc.start(now);
             osc.stop(now + 0.4);
        } else if (type === 'type') {
            osc.frequency.setValueAtTime(350 + Math.random() * 50, now);
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    }
}
