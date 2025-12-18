import * as THREE from 'three';
import { state } from './state.js';

export class TreeManager {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.grown = false;

        // Hide initially
        this.group.scale.setScalar(0);

        this.leaves = [];
        this.lanterns = [];

        // Colors from orbs (hardcoded for now as per orbs.js)
        this.orbColors = [
            0x88ddff, // Cyan
            0xffaadd, // Pink
            0xaaffaa, // Green
            0xffffaa, // Yellow
            0xddaaff, // Purple
            0xffccaa  // Orange
        ];

        this.init();
    }

    init() {
        // Specifications:
        // trunk: Curved tube, taper
        // roots: 6 curved tubes
        // branches: 6 main + sub
        // canopy: 14 leaf clusters

        // --- Trunk ---
        // Simple curved trunk using quadratic bezier
        const trunkPath = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.5, 2, 0),
            new THREE.Vector3(0, 5, 0)
        );
        const trunkGeo = new THREE.TubeGeometry(trunkPath, 20, 0.4, 8, false);
        // Taper hack: Scale rings in vertex shader or just use cone/cylinder for simplicity?
        // Or modify geometry. TubeGeometry doesn't support radius function easily in earlier versions,
        // but recent three.js does? Let's assume standard Tube for now, or just use Cylinder with modified vertices.
        // Let's stick to simple geometry for stability.

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 1.0 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        this.group.add(trunk);

        // --- Branches ---
        // Add some branches manually
        const branchPoints = [
             { pos: [0, 3, 0], rot: [0, 0, Math.PI/4] },
             { pos: [0, 4, 0], rot: [0, Math.PI/2, Math.PI/4] },
             { pos: [0, 3.5, 0], rot: [0, Math.PI, Math.PI/4] },
             { pos: [0, 4.2, 0], rot: [0, -Math.PI/2, Math.PI/4] },
        ];

        branchPoints.forEach(bp => {
            const branchGeo = new THREE.CylinderGeometry(0.1, 0.2, 2, 8);
            const branch = new THREE.Mesh(branchGeo, trunkMat);
            branch.position.set(...bp.pos);
            branch.rotation.set(...bp.rot);
            branch.position.add(new THREE.Vector3(0, 1, 0).applyEuler(branch.rotation)); // Offset
            this.group.add(branch);
        });

        // --- Canopy ---
        // Leaf clusters
        const clusterCenters = [
            [0, 5.5, 0], [1.5, 4.5, 0], [-1.5, 4.5, 0], [0, 4.5, 1.5], [0, 4.5, -1.5],
            [1, 6, 1], [-1, 6, -1], [1, 6, -1], [-1, 6, 1]
        ];

        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x5cb85c,
            flatShading: true,
            transparent: true,
            opacity: 0.9
        });

        clusterCenters.forEach(pos => {
            const geo = new THREE.IcosahedronGeometry(1, 0);
            geo.scale(1, 0.6, 1); // Flatten
            const mesh = new THREE.Mesh(geo, leafMat);
            mesh.position.set(...pos);
            // Add random rotation/scale
            mesh.scale.multiplyScalar(0.8 + Math.random() * 0.4);
            mesh.rotation.set(Math.random(), Math.random(), Math.random());
            this.group.add(mesh);
            this.leaves.push(mesh);
        });

        // --- Fairy Lights ---
        // Spiraling up the trunk
        this.createFairyLights(trunkPath);

        // --- Lanterns ---
        const lanternPositions = [
             [1, 4, 1], [-1, 3.5, -1], [1.2, 3.8, -0.5], [-0.8, 4.2, 1.2],
             [0.5, 4.5, 1.5], [-1.5, 4.0, 0.5] // Added 2 more to make 6
        ];

        lanternPositions.forEach((pos, i) => {
            const color = this.orbColors[i % this.orbColors.length];
            const lanternGroup = new THREE.Group();
            lanternGroup.position.set(...pos);

            // Core Sphere (The Lantern)
            const lanternGeo = new THREE.SphereGeometry(0.2, 16, 16);
            const lanternMat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 3.0 // Brighter
            });
            const lantern = new THREE.Mesh(lanternGeo, lanternMat);
            lanternGroup.add(lantern);

            // Halo Glow (Glassy Ambient Glow) - Large
            const haloGeo = new THREE.SphereGeometry(0.5, 16, 16);
            const haloMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.2,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.BackSide
            });
            const halo = new THREE.Mesh(haloGeo, haloMat);
            lanternGroup.add(halo);

            // Inner Halo for intensity
            const innerHaloGeo = new THREE.SphereGeometry(0.3, 16, 16);
            const innerHaloMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const innerHalo = new THREE.Mesh(innerHaloGeo, innerHaloMat);
            lanternGroup.add(innerHalo);

            // Point light
            const light = new THREE.PointLight(color, 1.5, 6);
            lanternGroup.add(light);

            this.group.add(lanternGroup);
            this.lanterns.push({ mesh: lanternGroup, baseY: pos[1], offset: Math.random() * 10 });
        });
    }

    createFairyLights(path) {
        const points = [];
        const count = 100;

        // Spiral around the path
        for(let i=0; i<=count; i++) {
            const t = i / count;
            const pointOnPath = path.getPointAt(t);
            const tangent = path.getTangentAt(t);
            const normal = new THREE.Vector3(1,0,0).applyAxisAngle(tangent, Math.PI/2); // Basic normal

            const radius = 0.45 * (1 - t * 0.5); // Tapering radius matching trunk
            const angle = t * Math.PI * 10; // 5 rotations

            // Displace from center
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Rotate displacement to align with path
            const dummy = new THREE.Object3D();
            dummy.lookAt(tangent);
            const displacement = new THREE.Vector3(x, 0, z);
            // Simplified displacement logic since lookAt alignment is tricky without frames
            // Just add spiraling manually around Y since trunk is mostly vertical

            const pos = new THREE.Vector3(
                pointOnPath.x + Math.cos(angle) * radius,
                pointOnPath.y,
                pointOnPath.z + Math.sin(angle) * radius
            );

            points.push(pos.x, pos.y, pos.z);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xffffee,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.fairyLights = new THREE.Points(geo, mat);
        this.group.add(this.fairyLights);
    }

    update(time) {
        if (state.currentAct >= 3 && this.group.scale.x < 1) {
            // Grow animation
            const growSpeed = 0.01;
            this.group.scale.addScalar(growSpeed);
            if(this.group.scale.x > 1) this.group.scale.setScalar(1);
        }

        // Idle animation
        if (this.group.scale.x > 0.1) {
            // Swaying
            this.group.rotation.z = Math.sin(time * 0.0005) * 0.02;

            // Lanterns float
            this.lanterns.forEach(l => {
                l.mesh.position.y = l.baseY + Math.sin(time * 0.002 + l.offset) * 0.05;
                // Pulse effect
                // l.mesh.children[0] is the main sphere
                // l.mesh.children[0].material.emissiveIntensity = 2.0 + Math.sin(time * 0.005 + l.offset) * 1.0;
            });

            // Twinkle fairy lights
            if (this.fairyLights) {
                 this.fairyLights.material.opacity = 0.6 + Math.sin(time * 0.005) * 0.2;
            }
        }
    }
}
