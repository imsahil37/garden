import * as THREE from 'three';
import { createGlowTexture } from './utils.js';

export class FirefliesManager {
    constructor(scene) {
        this.scene = scene;
        this.fireflies = [];
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Cache texture for performance
        this.glowTexture = new THREE.CanvasTexture(createGlowTexture());

        this.init();
    }

    init() {
        const count = 40; // Fewer sprites than points, but higher quality

        const material = new THREE.SpriteMaterial({
            map: this.glowTexture,
            color: 0xffffcc, // Warm yellow
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.8
        });

        for(let i=0; i<count; i++) {
            const firefly = new THREE.Sprite(material.clone()); // Clone to allow individual opacity

            // Random start position around the island
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 8;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = 1 + Math.random() * 4;

            firefly.position.set(x, y, z);
            firefly.scale.setScalar(0.2 + Math.random() * 0.3); // Varying sizes

            // Custom properties for animation
            firefly.userData = {
                basePos: new THREE.Vector3(x, y, z),
                offset: Math.random() * 100,
                speed: 0.5 + Math.random() * 0.5,
                amp: 0.5 + Math.random() * 1.0,
                yAmp: 0.2 + Math.random() * 0.5,
                pulseSpeed: 1.0 + Math.random() * 2.0
            };

            this.group.add(firefly);
            this.fireflies.push(firefly);
        }
    }

    update(time) {
        const t = time * 0.001; // Seconds

        this.fireflies.forEach(firefly => {
            const u = firefly.userData;

            // Complex organic movement using multiple sine waves
            const x = u.basePos.x + Math.sin(t * u.speed + u.offset) * u.amp;
            const z = u.basePos.z + Math.cos(t * u.speed * 0.8 + u.offset) * u.amp;
            const y = u.basePos.y + Math.sin(t * u.speed * 1.5 + u.offset) * u.yAmp;

            firefly.position.set(x, y, z);

            // Pulse opacity
            // Base opacity 0.4, oscillates up to 1.0
            const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * u.pulseSpeed + u.offset));
            firefly.material.opacity = pulse;

            // Subtle scale pulse matching opacity
            const scalePulse = 0.8 + 0.2 * pulse;
            firefly.scale.setScalar((0.2 + u.amp * 0.1) * scalePulse);
        });
    }
}
