import * as THREE from 'three';
import { state } from './state.js';
import { createGlowTexture } from './utils.js';

export class FlowersManager {
    constructor(scene) {
        this.scene = scene;
        this.flowers = [];
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Colors from orbs (duplicated for reference, but we use the index to pick)
        this.colors = [
            0x88ddff, // Cyan
            0xffaadd, // Pink
            0xaaffaa, // Green
            0xffffaa, // Yellow
            0xddaaff, // Purple
            0xffccaa  // Orange
        ];

        // Cache texture
        this.glowTexture = new THREE.CanvasTexture(createGlowTexture());
    }

    spawnFlower(position, index) {
        const color = this.colors[index % this.colors.length];

        const flowerGroup = new THREE.Group();
        flowerGroup.position.copy(position);
        flowerGroup.scale.setScalar(0); // Start small for animation

        // --- Stem ---
        // Slightly thicker and taller
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.6, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.3;
        flowerGroup.add(stem);

        // --- Petal Group (for complex flower) ---
        const petalGroup = new THREE.Group();
        petalGroup.position.y = 0.6;
        flowerGroup.add(petalGroup);

        // Layer 1: Outer Petals
        const petalGeo = new THREE.CircleGeometry(0.25, 16); // Larger petals
        const petalMat = new THREE.MeshStandardMaterial({
            color: color,
            side: THREE.DoubleSide,
            emissive: color,
            emissiveIntensity: 0.5
        });

        const outerCount = 6;
        for(let i=0; i<outerCount; i++) {
            const angle = (i / outerCount) * Math.PI * 2;
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.rotation.x = -Math.PI / 2.2; // Slightly angled up
            petal.rotation.z = angle;
            petal.translateX(0.15); // Move out from center
            petalGroup.add(petal);
        }

        // Layer 2: Inner Petals (Smaller, darker or lighter, rotated)
        const innerGeo = new THREE.CircleGeometry(0.15, 16);
        const innerMat = new THREE.MeshStandardMaterial({
            color: color,
            side: THREE.DoubleSide,
            emissive: color,
            emissiveIntensity: 0.8
        });

        const innerCount = 5;
        for(let i=0; i<innerCount; i++) {
            const angle = (i / innerCount) * Math.PI * 2 + (Math.PI / outerCount); // Offset angle
            const petal = new THREE.Mesh(innerGeo, innerMat);
            petal.rotation.x = -Math.PI / 2.5; // More angled up
            petal.rotation.z = angle;
            petal.translateX(0.1);
            petalGroup.add(petal);
        }

        // --- Center ---
        const centerGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const centerMat = new THREE.MeshStandardMaterial({
            color: 0xffffaa,
            emissive: 0xffffaa,
            emissiveIntensity: 1.0
        });
        const center = new THREE.Mesh(centerGeo, centerMat);
        center.position.y = 0.05; // Relative to petalGroup
        petalGroup.add(center);

        // --- Ambient Glow (Sprite) ---
        const glowMat = new THREE.SpriteMaterial({
            map: this.glowTexture,
            color: color,
            transparent: true,
            opacity: 0.7, // Start visible
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const glow = new THREE.Sprite(glowMat);
        glow.position.y = 0.6;
        glow.scale.setScalar(2.0); // Large soft glow
        flowerGroup.add(glow);

        this.group.add(flowerGroup);

        this.flowers.push({
            group: flowerGroup,
            targetScale: 1.8, // Bigger scale as requested
            currentScale: 0.0,
            glow: glow
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
                const pGeo = new THREE.CircleGeometry(0.25, 16); // Slightly bigger
                const pMat = new THREE.MeshStandardMaterial({
                    color: petalColor,
                    side: THREE.DoubleSide,
                    emissive: petalColor,
                    emissiveIntensity: 1.5
                });
                const petal = new THREE.Mesh(pGeo, pMat);
                petal.rotation.x = -Math.PI / 3; // Angled up
                petal.rotation.y = pAngle;
                // Move out slightly
                petal.translateX(0.08);

                lotusGroup.add(petal);
            }

            // Sprite Glow
            const glowMat = new THREE.SpriteMaterial({
                map: this.glowTexture,
                color: 0xff69b4,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            const glow = new THREE.Sprite(glowMat);
            glow.position.y = 0.2;
            glow.scale.setScalar(1.5);
            lotusGroup.add(glow);

            this.group.add(lotusGroup);

            this.flowers.push({
                group: lotusGroup,
                targetScale: 1.0 + Math.random() * 0.4,
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

            // Pulse glow
            if (flower.glow) {
                 flower.glow.material.opacity = 0.6 + Math.sin(time * 0.003 + flower.group.position.x) * 0.2;
            }
        });
    }
}
