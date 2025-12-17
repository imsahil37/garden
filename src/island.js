import * as THREE from 'three';

export class Island {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.init();
    }

    init() {
        // Specifications:
        // shape: "Cylinder top + Cone bottom",
        // topRadius: 6, bottomRadius: 5.5 (for cylinder part?), wait.
        // Spec says: Cylinder top + Cone bottom.
        // Let's interpret:
        // Top layer: Cylinder (grass)
        // Bottom layer: Cone (earth)

        const topRadius = 6;
        const thickness = 1;
        const bottomDepth = 4;

        // Group to hold everything
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // 1. Grass Top
        const grassGeometry = new THREE.CylinderGeometry(topRadius, topRadius, thickness, 64);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x7ec850,
            roughness: 1.0,
            flatShading: true
        });
        this.grass = new THREE.Mesh(grassGeometry, grassMaterial);
        this.grass.position.y = thickness / 2;
        this.grass.receiveShadow = true;
        this.modifyGeometry(this.grass.geometry, 0.2); // Add some noise
        this.group.add(this.grass);

        // 2. Earth Bottom (Cone)
        const earthGeometry = new THREE.ConeGeometry(topRadius * 0.9, bottomDepth, 64);
        const earthMaterial = new THREE.MeshStandardMaterial({
            color: 0x5c4033,
            roughness: 1.0,
            flatShading: true
        });
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.geometry.rotateX(Math.PI); // Point down
        this.earth.position.y = -bottomDepth / 2;
        this.modifyGeometry(this.earth.geometry, 0.5); // More noise for rocks/earth
        this.group.add(this.earth);

        // 3. Pond
        const pondRadius = 2;
        const pondGeometry = new THREE.CircleGeometry(pondRadius, 64);
        const pondMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x4a90d9,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.6,
            thickness: 0.5,
            transparent: true,
            opacity: 0.8
        });
        this.pond = new THREE.Mesh(pondGeometry, pondMaterial);
        this.pond.rotation.x = -Math.PI / 2;
        this.pond.position.y = thickness + 0.05; // Slightly above grass
        this.pond.position.x = 2; // Offset
        this.pond.position.z = 1;

        // Add random displacement for initial wave state
        const pos = this.pond.geometry.attributes.position;
        for(let i=0; i<pos.count; i++) {
            pos.setZ(i, pos.getZ(i) + Math.random() * 0.05);
        }

        this.group.add(this.pond);

        // Stones around pond
        this.addStones(pondRadius, 2, 1);

        // Scattered rocks
        this.addScatteredRocks(15);
    }

    modifyGeometry(geometry, magnitude) {
        const positionAttribute = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);

            // Don't mess up the center top too much (keep it relatively flat for walking/orbs)
            // if (vertex.y > 0 && Math.sqrt(vertex.x**2 + vertex.z**2) < 4) continue;

            // Simple noise
            const noise = (Math.random() - 0.5) * magnitude;

            // Apply noise based on position to keep general shape
            vertex.x += (Math.random() - 0.5) * magnitude;
            vertex.z += (Math.random() - 0.5) * magnitude;
            // vertex.y += (Math.random() - 0.5) * magnitude;

            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        geometry.computeVertexNormals();
    }

    addStones(pondRadius, centerX, centerZ) {
        const stoneCount = 12;
        for(let i=0; i<stoneCount; i++) {
            const angle = (i / stoneCount) * Math.PI * 2;
            const r = pondRadius + 0.3 + Math.random() * 0.3;
            const x = centerX + Math.cos(angle) * r;
            const z = centerZ + Math.sin(angle) * r;

            const size = 0.2 + Math.random() * 0.2;
            const stoneGeo = new THREE.DodecahedronGeometry(size, 0);
            const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888888, flatShading: true });
            const stone = new THREE.Mesh(stoneGeo, stoneMat);

            stone.position.set(x, 1, z); // 1 is grass top approx
            stone.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);

            this.group.add(stone);
        }
    }

    addScatteredRocks(count) {
        for(let i=0; i<count; i++) {
            const r = Math.random() * 5; // within radius
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;

             // Avoid pond area approx
            const distToPond = Math.sqrt((x-2)**2 + (z-1)**2);
            if(distToPond < 2.5) continue;

            const size = 0.1 + Math.random() * 0.3;
            const rockGeo = new THREE.DodecahedronGeometry(size, 0);
            const rockMat = new THREE.MeshStandardMaterial({ color: 0x666666, flatShading: true });
            const rock = new THREE.Mesh(rockGeo, rockMat);

            rock.position.set(x, 1, z);
            rock.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);

            this.group.add(rock);
        }
    }

    update(time) {
        // Subtle floating animation for the whole island
        this.group.position.y = Math.sin(time * 0.0005) * 0.2;

        // Animate pond waves
        if (this.pond) {
            const pos = this.pond.geometry.attributes.position;
            for(let i=0; i<pos.count; i++) {
                // Circular wave effect
                const x = pos.getX(i);
                const y = pos.getY(i);
                const dist = Math.sqrt(x*x + y*y);
                const z = Math.sin(dist * 5 - time * 0.002) * 0.05 + Math.sin(x * 3 + time * 0.001) * 0.02;
                pos.setZ(i, z);
            }
            pos.needsUpdate = true;
        }
    }
}
