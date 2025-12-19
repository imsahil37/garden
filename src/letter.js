import { state } from './state.js';
import { config } from './config.js';

export class LetterManager {
    constructor() {
        this.letterView = document.getElementById('letter-view');
        this.letterContent = document.getElementById('letter-content');
        this.letterSignature = document.getElementById('letter-signature');
        this.closeBtn = document.getElementById('close-letter-btn');
        this.isTyping = false;

        this.init();
    }

    init() {
        this.closeBtn.addEventListener('click', () => {
             this.closeLetter();
        });

        // Click on letter to skip typing
        this.letterView.addEventListener('click', () => {
             if (this.isTyping) {
                 this.skipTyping = true;
             }
        });

        state.on('actChanged', (act) => {
            if (act === 5) {
                this.showLetter();
            }
        });
    }

    showLetter() {
        this.letterView.classList.remove('hidden');
        this.letterView.style.opacity = 1;
        this.typeContent();
    }

    async typeContent() {
        if (this.isTyping) return;
        this.isTyping = true;

        const content = config.letter.content;
        this.letterContent.textContent = '';
        this.letterSignature.textContent = '';
        this.closeBtn.classList.add('hidden');

        for (let i = 0; i < content.length; i++) {
            this.letterContent.textContent += content[i];
            state.emit('typeChar');

            // Allow skipping by clicking
            if (this.skipTyping) {
                 this.letterContent.textContent = content;
                 break;
            }

            // Original pacing
            await new Promise(r => setTimeout(r, 30 + Math.random() * 50));
        }

        // Show signature
        await new Promise(r => setTimeout(r, 500));
        this.letterSignature.textContent = config.letter.signature;

        // Show close button
        await new Promise(r => setTimeout(r, 1000));
        this.closeBtn.classList.remove('hidden');

        this.isTyping = false;
    }

    closeLetter() {
        this.letterView.style.opacity = 0;
        setTimeout(() => {
            this.letterView.classList.add('hidden');
            state.setAct(3); // Go to Transformation
        }, 500);
    }
}
