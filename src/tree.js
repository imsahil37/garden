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

        // --- Lanterns ---
        const lanternPositions = [
             [1, 4, 1], [-1, 3.5, -1], [1.2, 3.8, -0.5], [-0.8, 4.2, 1.2]
        ];

        lanternPositions.forEach(pos => {
            const lanternGeo = new THREE.SphereGeometry(0.15, 16, 16);
            const lanternMat = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xffaa00,
                emissiveIntensity: 1
            });
            const lantern = new THREE.Mesh(lanternGeo, lanternMat);
            lantern.position.set(...pos);
            this.group.add(lantern);

            // Point light
            const light = new THREE.PointLight(0xffaa00, 0.5, 3);
            lantern.add(light);

            this.lanterns.push({ mesh: lantern, baseY: pos[1], offset: Math.random() * 10 });
        });
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
                l.mesh.material.emissiveIntensity = 0.8 + Math.sin(time * 0.005 + l.offset) * 0.4;
            });
        }
    }
}
