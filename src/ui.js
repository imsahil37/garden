import { config } from './config.js';
import { state } from './state.js';

export class UIManager {
    constructor() {
        this.memoryPopup = document.getElementById('memory-popup');
        this.memoryTitle = document.getElementById('memory-title');
        this.memoryText = document.getElementById('memory-text');
        this.closeMemoryBtn = document.getElementById('close-memory-btn');
        this.audioToggle = document.getElementById('audio-toggle');

        this.init();
    }

    init() {
        this.closeMemoryBtn.addEventListener('click', () => {
            this.hideMemory();
        });

        // Listen for audio toggle
        this.audioToggle.addEventListener('click', () => {
             state.isMuted = !state.isMuted;
             this.updateAudioIcon();
             state.emit('audioToggle', state.isMuted);
        });
    }

    showMemory(index) {
        const memory = config.memories[index];
        this.memoryTitle.textContent = memory.title;
        this.memoryText.textContent = memory.text;

        this.memoryPopup.classList.remove('hidden');
        this.memoryPopup.style.opacity = 1;
    }

    hideMemory() {
        this.memoryPopup.style.opacity = 0;
        setTimeout(() => {
            this.memoryPopup.classList.add('hidden');

            // Check if this was the last memory and trigger Letter (Act 5)
            if (state.memoriesCollected >= state.totalMemories && state.currentAct < 3) {
                state.setAct(5); // Letter
            }
        }, 300);
    }

    updateAudioIcon() {
        this.audioToggle.textContent = state.isMuted ? '🔇' : '🔊';
    }
}
