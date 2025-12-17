// Mobile optimizations
// Mostly handled by responsiveness in CSS and media queries
// and checking window size in SceneManager

import { state } from './state.js';

export class MobileManager {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.init();
    }

    init() {
        if (this.isMobile) {
            this.applyOptimizations();
        }
    }

    applyOptimizations() {
        // Lower resolution is handled in SceneManager via window.devicePixelRatio cap

        // Touch hints
        // Could add a small overlay "Tap to interact" if needed,
        // but the Loading screen text says "Enter the Garden" which implies interaction.

        // Disable some effects if performance is bad?
        // For now, we trust Three.js on modern mobile.
    }
}
