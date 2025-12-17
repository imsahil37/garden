import * as THREE from 'three';
import { state } from './state.js';

export class FlowersManager {
    constructor(scene) {
        this.scene = scene;
        this.flowers = [];
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Colors from spec
        this.colors = [0xffb6c1, 0xffd1dc, 0xdda0dd, 0xe6e6fa, 0xfff0f5, 0xffe4e1];
    }

    spawnFlower(position, index) {
        const color = this.colors[index % this.colors.length];

        const flowerGroup = new THREE.Group();
        flowerGroup.position.copy(position);
        flowerGroup.scale.setScalar(0); // Start small for animation

        // Stem
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.25;
        flowerGroup.add(stem);

        // Center
        const centerGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const centerMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const center = new THREE.Mesh(centerGeo, centerMat);
        center.position.y = 0.5;
        flowerGroup.add(center);

        // Petals
        const petalCount = 6;
        for(let i=0; i<petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const petalGeo = new THREE.CircleGeometry(0.15, 16);
            const petalMat = new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide });
            const petal = new THREE.Mesh(petalGeo, petalMat);

            petal.position.y = 0.5;
            petal.rotation.x = -Math.PI / 2; // Lay flat
            petal.rotation.z = angle;
            petal.translateX(0.12); // Move out from center

            flowerGroup.add(petal);
        }

        this.group.add(flowerGroup);

        this.flowers.push({
            group: flowerGroup,
            targetScale: 1.0,
            currentScale: 0.0
        });

        state.emit('flowerBloom');
    }

    update(time) {
        this.flowers.forEach(flower => {
            // Elastic scale up
            if (flower.currentScale < flower.targetScale) {
                flower.currentScale += (flower.targetScale - flower.currentScale) * 0.1;
                flower.group.scale.setScalar(flower.currentScale);
            }

            // Gentle swaying
            flower.group.rotation.z = Math.sin(time * 0.002 + flower.group.position.x) * 0.05;
            flower.group.rotation.x = Math.sin(time * 0.003 + flower.group.position.z) * 0.05;
        });
    }
}
