import * as THREE from 'three';
import { state } from './state.js';
import { config } from './config.js';

export class OrbsManager {
    constructor(scene, uiManager, flowerManager) {
        this.scene = scene;
        this.uiManager = uiManager;
        this.flowerManager = flowerManager;
        this.orbs = [];
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.init();
    }

    init() {
        const orbConfigs = [
            { main: 0x88ddff, emissive: 0x44aaff, position: { x: 4, y: 1.5, z: 0 } }, // Cyan
            { main: 0xffaadd, emissive: 0xff66aa, position: { x: 2, y: 2.0, z: 3.5 } }, // Pink
            { main: 0xaaffaa, emissive: 0x66ff88, position: { x: -2, y: 1.8, z: 3.5 } }, // Green
            { main: 0xffffaa, emissive: 0xffdd44, position: { x: -4, y: 2.2, z: 0 } }, // Yellow
            { main: 0xddaaff, emissive: 0xaa66ff, position: { x: -2, y: 1.6, z: -3.5 } }, // Purple
            { main: 0xffccaa, emissive: 0xff9966, position: { x: 2, y: 1.9, z: -3.5 } }  // Orange
        ];

        orbConfigs.forEach((cfg, index) => {
            if (index >= config.memories.length) return; // Safety check
            this.createOrb(cfg, index);
        });
    }

    createOrb(cfg, index) {
        const orbGroup = new THREE.Group();
        orbGroup.position.set(cfg.position.x, cfg.position.y, cfg.position.z);

        // 1. Core
        const coreGeo = new THREE.SphereGeometry(0.15, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        orbGroup.add(core);

        // 2. Main
        const mainGeo = new THREE.SphereGeometry(0.25, 32, 32);
        const mainMat = new THREE.MeshStandardMaterial({
            color: cfg.main,
            emissive: cfg.emissive,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        const main = new THREE.Mesh(mainGeo, mainMat);
        orbGroup.add(main);

        // 3. Glow
        const glowGeo = new THREE.SphereGeometry(0.4, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: cfg.main,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        orbGroup.add(glow);

        // Interaction Data
        // We attach it to the main mesh which is likely what the raycaster hits first or we check the group
        // Better to attach to a specific mesh that is large enough

        // Let's make an invisible hit sphere that is slightly larger
        const hitGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.userData = {
            isInteractable: true,
            id: index,
            onPointerOver: () => {
                document.body.style.cursor = 'pointer';
                // Hover effect
                main.scale.setScalar(1.2);
                glow.scale.setScalar(1.2);
                state.emit('orbHover');
            },
            onPointerOut: () => {
                document.body.style.cursor = 'default';
                // Reset effect
                main.scale.setScalar(1.0);
                glow.scale.setScalar(1.0);
            },
            onClick: () => {
                this.collectOrb(index, orbGroup);
            }
        };
        orbGroup.add(hitMesh);

        // Store reference
        this.orbs.push({
            group: orbGroup,
            main: main,
            glow: glow,
            hitMesh: hitMesh,
            baseY: cfg.position.y,
            index: index,
            collected: false
        });

        this.group.add(orbGroup);
    }

    collectOrb(index, orbGroup) {
        if (state.collectedMemoryIds.has(index)) return;

        state.collectMemory(index);
        state.emit('orbCollect');

        // Show popup
        this.uiManager.showMemory(index);

        // Spawn flower at orb position (projected to ground)
        const groundPos = orbGroup.position.clone();
        groundPos.y = 1; // Approx ground level
        this.flowerManager.spawnFlower(groundPos, index);

        // Disable orb interaction
        const orbData = this.orbs[index];
        orbData.collected = true;
        orbData.hitMesh.userData.isInteractable = false;

        // Burst Effect
        this.createBurst(orbGroup, orbData.main.material.color);

        // Hide original orb visuals immediately
        orbData.main.visible = false;
        orbData.glow.visible = false;

        // Create Lantern (after short delay or immediately? Let's do immediately but start small)
        this.createLantern(orbGroup, orbData.main.material.color);

        // Set flag to fly away
        orbData.flying = true;
    }

    createBurst(orbGroup, color) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(0, 0, 0); // Start at center
            velocities.push(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.2,
            transparent: true,
            opacity: 1
        });

        const points = new THREE.Points(geometry, material);
        orbGroup.add(points);

        // Store for animation
        this.orbs[orbGroup.userData.index || 0].burst = { points, velocities, life: 1.0 };
    }

    createLantern(orbGroup, color) {
        // Aesthetic lantern: Rectangular/Asian style or Cylinder
        const lanternGroup = new THREE.Group();
        lanternGroup.position.y = 0.0;
        lanternGroup.scale.setScalar(0); // Start scale 0 for pop effect

        // Frame color
        const frameColor = 0x4a3b2a; // Dark wood

        // Main paper body - taller, elegant
        const paperGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 4); // Boxy cylinder
        const paperMat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 2.0, // Brighter!
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide
        });
        const paper = new THREE.Mesh(paperGeo, paperMat);
        paper.rotation.y = Math.PI / 4; // Rotate for aesthetic angle
        lanternGroup.add(paper);

        // Top cap
        const capGeo = new THREE.BoxGeometry(0.4, 0.05, 0.4);
        const capMat = new THREE.MeshStandardMaterial({ color: frameColor });
        const topCap = new THREE.Mesh(capGeo, capMat);
        topCap.position.y = 0.42;
        topCap.rotation.y = Math.PI / 4;
        lanternGroup.add(topCap);

        // Bottom cap
        const bottomCap = new THREE.Mesh(capGeo, capMat);
        bottomCap.position.y = -0.42;
        bottomCap.rotation.y = Math.PI / 4;
        lanternGroup.add(bottomCap);

        // Point light inside
        const light = new THREE.PointLight(color, 2, 8); // Stronger light
        lanternGroup.add(light);

        orbGroup.add(lanternGroup);
        this.orbs[orbGroup.userData.index || 0].lantern = lanternGroup;
    }

    update(time) {
        this.orbs.forEach((orb, i) => {
            if (orb.collected) {
                // Update Burst
                if (orb.burst && orb.burst.life > 0) {
                    const pos = orb.burst.points.geometry.attributes.position;
                    for(let j=0; j<pos.count; j++) {
                        pos.setXYZ(
                            j,
                            pos.getX(j) + orb.burst.velocities[j*3],
                            pos.getY(j) + orb.burst.velocities[j*3+1],
                            pos.getZ(j) + orb.burst.velocities[j*3+2]
                        );
                    }
                    pos.needsUpdate = true;
                    orb.burst.points.material.opacity = orb.burst.life;
                    orb.burst.life -= 0.02;
                    if (orb.burst.life <= 0) orb.burst.points.visible = false;
                }

                if (orb.flying) {
                     // Scale up lantern if needed
                     if (orb.lantern && orb.lantern.scale.x < 1) {
                         orb.lantern.scale.addScalar(0.05);
                     }

                     // Float up
                     orb.group.position.y += 0.03;
                     orb.group.position.x += Math.sin(time * 0.001 + i) * 0.005;
                     orb.group.position.z += Math.cos(time * 0.001 + i) * 0.005;

                     // Gently sway rotation
                     if (orb.lantern) {
                         orb.lantern.rotation.z = Math.sin(time * 0.002 + i) * 0.05;
                         orb.lantern.rotation.x = Math.cos(time * 0.0015 + i) * 0.05;
                     }

                     if (orb.group.position.y > 30) {
                         orb.group.visible = false;
                         orb.flying = false;
                     }
                }
                return;
            }

            // Float: Gentle sine wave
            orb.group.position.y = orb.baseY + Math.sin(time * 0.0012 + i) * 0.15;

            // Rotate: Slow Y-axis
            orb.group.rotation.y = time * 0.0005;

            // Pulse: Emissive intensity
            orb.main.material.emissiveIntensity = 0.5 + Math.sin(time * 0.002) * 0.2;
        });
    }

    getInteractables() {
        return this.orbs.map(o => o.hitMesh);
    }
}
