import * as THREE from 'three';
import { state } from './state.js';

export class LightsManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = {};
        this.init();
    }

    init() {
        // Ambient Light - minimal base illumination
        const ambientLight = new THREE.AmbientLight(0x404080, 0.2); // Dark blue-ish ambient
        this.scene.add(ambientLight);
        this.lights.ambient = ambientLight;

        // Moon/Main Light
        const mainLight = new THREE.DirectionalLight(0xaaccff, 0.5);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        this.scene.add(mainLight);
        this.lights.main = mainLight;

        // Rim Light for the island
        const rimLight = new THREE.SpotLight(0xffaaee, 0.5);
        rimLight.position.set(-10, 5, -10);
        rimLight.lookAt(0, 0, 0);
        this.scene.add(rimLight);
        this.lights.rim = rimLight;

        // Point lights for flowers/orbs will be added by their respective classes,
        // or we can manage a pool here if performance dictates.
    }

    update() {
        // Dynamic lighting based on progress
        // Act 2: World Brightens (Progressive lighting increase)

        const targetIntensity = 0.2 + (state.memoriesCollected / state.totalMemories) * 0.5;

        // Smooth transition
        this.lights.ambient.intensity += (targetIntensity - this.lights.ambient.intensity) * 0.01;

        // Change colors in Act 3 (Transformation)
        if (state.currentAct >= 3) {
             // Sky Changes: Colors shift to magical purple/pink
             // We can simulate this by changing light colors
             const targetColor = new THREE.Color(0xffaaee);
             this.lights.main.color.lerp(targetColor, 0.005);
        }
    }
}
