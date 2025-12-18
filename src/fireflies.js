import * as THREE from 'three';

export class FirefliesManager {
    constructor(scene) {
        this.scene = scene;
        this.fireflies = null;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.init();
    }

    init() {
        // Use Points for performance instead of individual Meshes
        const count = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const offsets = []; // Random offset for animation

        for(let i=0; i<count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = Math.random() * 6 + 1;
            const z = (Math.random() - 0.5) * 20;

            positions.push(x, y, z);
            offsets.push(Math.random() * 100);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('offset', new THREE.Float32BufferAttribute(offsets, 1));

        // Custom shader for firefly movement & twinkling
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0xffffcc) }
            },
            vertexShader: `
                uniform float uTime;
                attribute float offset;
                varying float vAlpha;

                void main() {
                    vec3 pos = position;

                    // Wander movement
                    pos.x += sin(uTime * 0.5 + offset) * 1.5;
                    pos.z += cos(uTime * 0.5 + offset) * 1.5;
                    pos.y += sin(uTime * 1.0 + offset) * 0.5;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    // Size attenuation
                    gl_PointSize = (100.0 / -mvPosition.z);

                    // Twinkle
                    vAlpha = 0.5 + 0.5 * sin(uTime * 2.0 + offset);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vAlpha;

                void main() {
                    // Circular soft particle
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;

                    float glow = 1.0 - (dist * 2.0);
                    gl_FragColor = vec4(uColor, vAlpha * glow);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.fireflies = new THREE.Points(geometry, material);
        this.group.add(this.fireflies);
    }

    update(time) {
        if (this.fireflies) {
            this.fireflies.material.uniforms.uTime.value = time * 0.001;
        }
    }
}
