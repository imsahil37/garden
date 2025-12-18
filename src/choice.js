import { state } from './state.js';

export class ChoiceManager {
    constructor() {
        this.choiceView = document.getElementById('choice-view');
        this.messageInputView = document.getElementById('message-input-view');
        this.finalMessageView = document.getElementById('final-message-view');
        this.certificateView = document.getElementById('certificate-view');
        this.exploreBtn = document.getElementById('explore-btn');

        this.messageText = document.getElementById('message-text');
        this.cancelMessageBtn = document.getElementById('cancel-message-btn');
        this.sendMessageBtn = document.getElementById('send-message-btn');

        this.finalTitle = document.getElementById('final-title');
        this.finalBody = document.getElementById('final-body');

        this.init();
    }

    init() {
        state.on('actChanged', (act) => {
            if (act === 6) {
                this.showChoices();
            }
        });

        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.target.dataset.choice;
                this.handleChoice(choice);
            });
        });

        this.cancelMessageBtn.addEventListener('click', () => {
             this.messageInputView.classList.add('hidden');
             this.choiceView.classList.remove('hidden');
        });

        this.sendMessageBtn.addEventListener('click', () => {
             const message = this.messageText.value;
             // Save/Send message
             localStorage.setItem('garden_message', message);
             this.showFinalMessage("Message Sent", "Thank you for your words.");
             this.messageInputView.classList.add('hidden');
        });

        if (this.exploreBtn) {
            this.exploreBtn.addEventListener('click', () => {
                this.certificateView.classList.add('hidden');
                // Optional: Enable free cam or just hide UI
            });
        }
    }

    showChoices() {
        this.choiceView.classList.remove('hidden');
        this.choiceView.style.opacity = 1;
    }

    handleChoice(choice) {
        this.choiceView.classList.add('hidden');

        if (choice === 'forgive') {
             this.certificateView.classList.remove('hidden');
             localStorage.setItem('garden_choice', 'forgive');
             // Celebration effects in scene?
        } else if (choice === 'message') {
            this.messageInputView.classList.remove('hidden');
        } else if (choice === 'time') {
            this.showFinalMessage("I Understand", "Take all the time you need.");
            localStorage.setItem('garden_choice', 'time');
        }
    }

    showFinalMessage(title, body) {
        this.finalTitle.textContent = title;
        this.finalBody.textContent = body;
        this.finalMessageView.classList.remove('hidden');
    }
}
