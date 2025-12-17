import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { state } from './state.js';

export class ControlsManager {
    constructor(camera, domElement) {
        this.controls = new OrbitControls(camera, domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going under the island
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;

        // Disable interaction initially (during Act 1 intro) if needed,
        // but spec says "Slowly auto-rotating" which OrbitControls handles.
        // Spec also mentions "Drag: Orbit camera" so interaction should be enabled.
    }

    update() {
        // Adjust auto-rotate speed based on state if needed
        if (state.currentAct === 0) {
            this.controls.autoRotateSpeed = 2.0;
        } else {
            this.controls.autoRotateSpeed = 0.5;
        }

        // Stop auto-rotation if user interacts?
        // Usually OrbitControls handles this by stopping autoRotate when user drags.

        this.controls.update();
    }

    setAutoRotate(enabled) {
        this.controls.autoRotate = enabled;
    }
}
