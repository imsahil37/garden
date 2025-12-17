import * as THREE from 'three';
import { state } from './state.js';

export class ParticlesManager {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Falling hearts
        this.hearts = [];
        this.heartsGroup = new THREE.Group();
        this.scene.add(this.heartsGroup);

        // Heart shape
        const heartShape = new THREE.Shape();
        const x = 0, y = 0;
        heartShape.moveTo( x + 0.25, y + 0.25 );
        heartShape.bezierCurveTo( x + 0.25, y + 0.25, x + 0.20, y, x, y );
        heartShape.bezierCurveTo( x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35 );
        heartShape.bezierCurveTo( x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 0.95 );
        heartShape.bezierCurveTo( x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35 );
        heartShape.bezierCurveTo( x + 0.80, y + 0.35, x + 0.80, y, x + 0.50, y );
        heartShape.bezierCurveTo( x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25 );

        this.heartGeometry = new THREE.ShapeGeometry(heartShape);
        this.heartMaterial = new THREE.MeshBasicMaterial( { color: 0xff69b4, side: THREE.DoubleSide } );
    }

    update(time) {
        // Falling hearts in Act 3+
        if (state.currentAct >= 3) {
            if (Math.random() < 0.05) { // Spawn rate
                this.spawnHeart();
            }
        }

        // Update hearts
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            const heart = this.hearts[i];
            heart.mesh.position.y -= 0.02;
            heart.mesh.rotation.y += 0.01;
            heart.mesh.rotation.z = Math.sin(time * 0.002 + heart.offset) * 0.5;

            if (heart.mesh.position.y < -5) {
                this.heartsGroup.remove(heart.mesh);
                this.hearts.splice(i, 1);
            }
        }
    }

    spawnHeart() {
        const mesh = new THREE.Mesh(this.heartGeometry, this.heartMaterial);
        const x = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;

        mesh.position.set(x, 10, z);
        mesh.scale.setScalar(0.2);
        mesh.rotation.x = Math.PI;

        this.heartsGroup.add(mesh);

        this.hearts.push({
            mesh: mesh,
            offset: Math.random() * 100
        });
    }
}
