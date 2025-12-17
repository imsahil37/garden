import { state } from './state.js';

export class LoadingManager {
    constructor() {
        this.screen = document.getElementById('loading-screen');
        this.progressBar = document.querySelector('.progress-fill');
        this.loadingText = document.getElementById('loading-text');
        this.enterBtn = document.getElementById('enter-btn');
        this.uiContainer = document.getElementById('ui-container');

        this.progress = 0;

        this.init();
    }

    init() {
        // Simulate loading
        this.simulateLoading();

        this.enterBtn.addEventListener('click', () => {
             this.startExperience();
        });
    }

    simulateLoading() {
        const interval = setInterval(() => {
            this.progress += Math.random() * 5;
            if (this.progress >= 100) {
                this.progress = 100;
                clearInterval(interval);
                this.onLoadComplete();
            }
            this.updateUI();
        }, 100);
    }

    updateUI() {
        this.progressBar.style.width = `${this.progress}%`;

        if (this.progress > 30 && this.progress < 60) {
            this.loadingText.textContent = "Gathering memories...";
        } else if (this.progress > 60 && this.progress < 90) {
            this.loadingText.textContent = "Preparing the light...";
        } else if (this.progress >= 100) {
            this.loadingText.textContent = "Ready.";
        }
    }

    onLoadComplete() {
        this.enterBtn.classList.remove('hidden');
        this.loadingText.classList.add('hidden'); // Optional
    }

    startExperience() {
        this.screen.style.opacity = 0;
        setTimeout(() => {
            this.screen.classList.add('hidden');
            state.emit('start');
            state.setAct(1); // Arrival

            // Show intro text
            this.showIntroText();

        }, 1000);
    }

    showIntroText() {
        const storyOverlay = document.getElementById('story-overlay');
        const storyText = document.getElementById('story-text');

        storyOverlay.classList.remove('hidden');
        storyText.textContent = "Every garden needs care… let me tend to ours.";
        storyText.style.opacity = 0;

        // Fade in
        setTimeout(() => { storyText.style.opacity = 1; }, 500);

        // Fade out after a while and transition to Act 2
        setTimeout(() => {
            storyText.style.opacity = 0;
            setTimeout(() => {
                 storyOverlay.classList.add('hidden');
                 state.setAct(2); // Discovery
            }, 1000);
        }, 5000);
    }
}
