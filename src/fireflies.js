import * as THREE from 'three';

export class FirefliesManager {
    constructor(scene) {
        this.scene = scene;
        this.fireflies = [];
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.init();
    }

    init() {
        const count = 30;
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.8 });

        for(let i=0; i<count; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            const x = (Math.random() - 0.5) * 15;
            const y = Math.random() * 5 + 1;
            const z = (Math.random() - 0.5) * 15;

            mesh.position.set(x, y, z);
            this.group.add(mesh);

            this.fireflies.push({
                mesh: mesh,
                basePos: new THREE.Vector3(x, y, z),
                speed: 0.002 + Math.random() * 0.002,
                offset: Math.random() * 100
            });
        }
    }

    update(time) {
        this.fireflies.forEach(f => {
            f.mesh.position.x = f.basePos.x + Math.sin(time * f.speed + f.offset) * 1;
            f.mesh.position.z = f.basePos.z + Math.cos(time * f.speed + f.offset) * 1;
            f.mesh.position.y = f.basePos.y + Math.sin(time * f.speed * 2 + f.offset) * 0.5;

            f.mesh.material.opacity = 0.4 + Math.sin(time * 0.005 + f.offset) * 0.4;
        });
    }
}
