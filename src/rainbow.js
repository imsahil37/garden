import * as THREE from 'three';
import { state } from './state.js';

export class RainbowManager {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Hide initially
        this.group.visible = false;

        this.init();
    }

    init() {
        // 7 TorusGeometry arcs (ROYGBIV)
        // colors: [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3]
        const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];

        const radius = 20;
        const tube = 0.5;

        colors.forEach((color, i) => {
            const geo = new THREE.TorusGeometry(radius + i * tube * 0.8, tube, 16, 100, Math.PI);
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0, // Start invisible
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geo, mat);
            // Rotate to stand up
            mesh.position.z = -10;
            this.group.add(mesh);
        });

        this.group.position.set(0, -5, -20);
    }

    update(time) {
        if (state.currentAct >= 3) {
            if (!this.group.visible) this.group.visible = true;

            // Fade in & Animate
            this.group.children.forEach((mesh, i) => {
                // Fade in
                if (mesh.material.opacity < 0.3) {
                    mesh.material.opacity += 0.001;
                }

                // Animation: Pulse opacity slightly
                mesh.material.opacity = 0.3 + Math.sin(time * 0.002 + i * 0.5) * 0.05;

                // Slight rotation wiggle
                mesh.rotation.z = Math.sin(time * 0.0005 + i * 0.1) * 0.02;
            });
        }
    }
}
