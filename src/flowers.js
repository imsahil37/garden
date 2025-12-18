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
        const centerMat = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        const center = new THREE.Mesh(centerGeo, centerMat);
        center.position.y = 0.5;
        flowerGroup.add(center);

        // Petals
        const petalCount = 6;
        for(let i=0; i<petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const petalGeo = new THREE.CircleGeometry(0.15, 16);
            const petalMat = new THREE.MeshStandardMaterial({
                color: color,
                side: THREE.DoubleSide,
                emissive: color,
                emissiveIntensity: 0.3
            });
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

    spawnLotus(pondRadius = 2) {
        const count = 5;
        for(let i=0; i<count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * (pondRadius - 0.5);
            const x = 2 + Math.cos(angle) * r; // pond center x is 2
            const z = 1 + Math.sin(angle) * r; // pond center z is 1

            const lotusGroup = new THREE.Group();
            lotusGroup.position.set(x, 1.1, z); // Slightly above water
            lotusGroup.scale.setScalar(0);

            // Petals
            const petalColor = 0xff69b4; // Hot pink
            const petalCount = 8;
            for(let j=0; j<petalCount; j++) {
                const pAngle = (j / petalCount) * Math.PI * 2;
                const pGeo = new THREE.CircleGeometry(0.2, 16);
                const pMat = new THREE.MeshStandardMaterial({
                    color: petalColor,
                    side: THREE.DoubleSide,
                    emissive: petalColor,
                    emissiveIntensity: 0.8
                });
                const petal = new THREE.Mesh(pGeo, pMat);
                petal.rotation.x = -Math.PI / 3; // Angled up
                petal.rotation.y = pAngle;
                // Move out slightly
                petal.translateX(0.05);

                lotusGroup.add(petal);
            }

            // Center Light (Removed for performance, using high emissive instead)
            // const light = new THREE.PointLight(0xff69b4, 1, 2);
            // light.position.y = 0.2;
            // lotusGroup.add(light);

            // Add a glowing center mesh instead
            const glowGeo = new THREE.SphereGeometry(0.15, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.8 });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.y = 0.1;
            lotusGroup.add(glow);

            this.group.add(lotusGroup);

            this.flowers.push({
                group: lotusGroup,
                targetScale: 0.8 + Math.random() * 0.4,
                currentScale: 0.0,
                isLotus: true,
                baseY: 1.1,
                offset: Math.random() * 10
            });
        }
    }

    update(time) {
        // Grow lotuses in Act 3
        if (state.currentAct >= 3 && !this.lotusSpawned) {
             this.spawnLotus();
             this.lotusSpawned = true;
        }

        this.flowers.forEach(flower => {
            // Elastic scale up
            if (flower.currentScale < flower.targetScale) {
                flower.currentScale += (flower.targetScale - flower.currentScale) * 0.1;
                flower.group.scale.setScalar(flower.currentScale);
            }

            // Gentle swaying
            flower.group.rotation.z = Math.sin(time * 0.002 + flower.group.position.x) * 0.05;
            flower.group.rotation.x = Math.sin(time * 0.003 + flower.group.position.z) * 0.05;

            if (flower.isLotus) {
                // Bobbing on water
                flower.group.position.y = flower.baseY + Math.sin(time * 0.002 + flower.offset) * 0.05;
            }
        });
    }
}
