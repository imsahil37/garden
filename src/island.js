import * as THREE from 'three';
import { state } from './state.js';
import { createNoiseTexture } from './utils.js';
import { Reflector } from './Reflector.js';

export class Island {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        const topRadius = 6;
        const thickness = 1;
        const bottomDepth = 4;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Textures
        const groundTexture = new THREE.CanvasTexture(createNoiseTexture());
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(4, 4);

        // Water Distortion Map
        const waterNormals = new THREE.CanvasTexture(createNoiseTexture()); // Reuse noise for now, works for dudv
        waterNormals.wrapS = THREE.RepeatWrapping;
        waterNormals.wrapT = THREE.RepeatWrapping;
        waterNormals.repeat.set(4, 4);

        // 1. Grass Top (Initially Dry/Brown)
        const grassGeometry = new THREE.CylinderGeometry(topRadius, topRadius, thickness, 64);

        // Custom shader for grass transition + texture
        this.grassMaterial = new THREE.MeshStandardMaterial({
            map: groundTexture,
            color: 0x8B4513, // Start Brown
            roughness: 1.0,
            flatShading: false
        });

        this.grass = new THREE.Mesh(grassGeometry, this.grassMaterial);
        this.grass.position.y = thickness / 2;
        this.grass.receiveShadow = true;
        this.modifyGeometry(this.grass.geometry, 0.2);
        this.group.add(this.grass);

        // 2. Earth Bottom
        const earthGeometry = new THREE.ConeGeometry(topRadius * 0.9, bottomDepth, 64);
        const earthMaterial = new THREE.MeshStandardMaterial({
            map: groundTexture,
            color: 0x5c4033,
            roughness: 1.0,
            flatShading: true
        });
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.geometry.rotateX(Math.PI);
        this.earth.position.y = -bottomDepth / 2;
        this.modifyGeometry(this.earth.geometry, 0.5);
        this.group.add(this.earth);

        // 3. Pond (Reflector for Glassy Water)
        const pondRadius = 2.5; // Increased size to remove gaps
        const pondGeometry = new THREE.CircleGeometry(pondRadius, 64);

        this.pond = new Reflector(pondGeometry, {
            clipBias: 0.003,
            textureWidth: 1024,
            textureHeight: 1024,
            color: 0x88ccff,
            multisample: 2,
            distortionMap: waterNormals
        });

        this.pond.rotation.x = -Math.PI / 2;
        this.pond.position.set(2, thickness + 0.05, 1); // Slight lower to fit terrain

        this.group.add(this.pond);

        // Stones & Rocks
        this.addStones(pondRadius, 2, 1);
        this.addScatteredRocks(15);

        // 4. Grass Blades (InstancedMesh)
        this.initGrass(topRadius);
    }

    initGrass(radius) {
        const count = 3000;
        const bladeGeo = new THREE.PlaneGeometry(0.1, 0.5, 1, 4);
        bladeGeo.translate(0, 0.25, 0); // Pivot at bottom

        // Custom shader for grass wind
        this.grassUniforms = {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0x8B4513) } // Start dry
        };

        const bladeMat = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float uTime;
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    vec3 pos = position;

                    // Wind effect based on height (pos.y) and random position
                    float wind = sin(uTime * 2.0 + instanceMatrix[3][0] * 5.0) * 0.2 * pos.y;
                    pos.x += wind;

                    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying vec2 vUv;

                void main() {
                    // Gradient on blade
                    vec3 color = mix(uColor * 0.5, uColor, vUv.y);
                    if (gl_FrontFacing == false) color *= 0.8;
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            uniforms: this.grassUniforms,
            side: THREE.DoubleSide
        });

        this.grassBlades = new THREE.InstancedMesh(bladeGeo, bladeMat, count);
        this.group.add(this.grassBlades);

        const dummy = new THREE.Object3D();
        let i = 0;
        while(i < count) {
            const r = Math.random() * (radius - 0.5);
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;

            // Avoid pond area
            if (Math.sqrt((x-2)**2 + (z-1)**2) < 2.2) continue;

            dummy.position.set(x, 1, z); // On top of island
            dummy.rotation.y = Math.random() * Math.PI;
            dummy.scale.setScalar(0.5 + Math.random() * 0.5);
            dummy.updateMatrix();
            this.grassBlades.setMatrixAt(i++, dummy.matrix);
        }
    }

    modifyGeometry(geometry, magnitude) {
        const positionAttribute = geometry.attributes.position;
        const vertex = new THREE.Vector3();
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            vertex.x += (Math.random() - 0.5) * magnitude;
            vertex.z += (Math.random() - 0.5) * magnitude;
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
            stone.position.set(x, 1, z);
            stone.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
            this.group.add(stone);
        }
    }

    addScatteredRocks(count) {
        for(let i=0; i<count; i++) {
            const r = Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
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
        this.group.position.y = Math.sin(time * 0.0005) * 0.2;

        // Update uniforms
        if (this.grassUniforms) this.grassUniforms.uTime.value = time * 0.001;

        // Update Reflector
        if (this.pond && this.pond.material.uniforms.uTime) {
            this.pond.material.uniforms.uTime.value = time * 0.001;
        }

        // Transition Colors based on progress (Cubic curve for delayed greening)
        const rawProgress = Math.min(state.memoriesCollected / state.totalMemories, 1.0);
        const progress = Math.pow(rawProgress, 3); // Stays brown longer

        // Dry Brown (8B4513) to Lush Green (7EC850)
        const startColor = new THREE.Color(0x8B4513);
        const endColor = new THREE.Color(0x7EC850);
        const currentColor = startColor.clone().lerp(endColor, progress);

        if (this.grassMaterial) this.grassMaterial.color.copy(currentColor);
        if (this.grassUniforms) this.grassUniforms.uColor.value.copy(currentColor);
    }
}
