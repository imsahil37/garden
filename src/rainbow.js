import * as THREE from 'three';
import { state } from './state.js';

export class RainbowManager {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Hide initially
        this.group.visible = false;

        this.init();
    }

    init() {
        const radius = 20;
        const tube = 0.5;
        const segmentCount = 7;

        // Define rainbow colors
        // Brighter Colors for Glow Effect
        const colors = [
             new THREE.Color(0xff3333).multiplyScalar(1.5), // Red
             new THREE.Color(0xffaa33).multiplyScalar(1.5), // Orange
             new THREE.Color(0xffff33).multiplyScalar(1.5), // Yellow
             new THREE.Color(0x33ff33).multiplyScalar(1.5), // Green
             new THREE.Color(0x3333ff).multiplyScalar(1.5), // Blue
             new THREE.Color(0x8a2be2).multiplyScalar(1.5), // Indigo
             new THREE.Color(0xee82ee).multiplyScalar(1.5)  // Violet
        ];

        // Custom Shader for Glassy/Glowy effect
        const rainbowVertexShader = `
            varying vec2 vUv;
            varying vec3 vViewPosition;
            varying vec3 vNormal;

            void main() {
                vUv = uv;
                vec3 pos = position;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;

                vViewPosition = -mvPosition.xyz;
                vNormal = normalMatrix * normal;
            }
        `;

        const rainbowFragmentShader = `
            uniform vec3 uColor;
            uniform float uOpacity;

            varying vec2 vUv;
            varying vec3 vViewPosition;
            varying vec3 vNormal;

            void main() {
                // Fresnel
                vec3 viewDir = normalize(vViewPosition);
                vec3 normal = normalize(vNormal);
                float fresnel = dot(viewDir, normal);
                fresnel = clamp(1.0 - abs(fresnel), 0.0, 1.0);
                fresnel = pow(fresnel, 1.5); // Edge glow (Softened power for wider glow)

                // Base color boosted
                vec3 color = uColor;

                // Final alpha combines base opacity with fresnel edge enhancement
                float alpha = uOpacity * (0.4 + fresnel * 0.8);

                // Additive glow boost
                vec3 finalColor = color + (color * fresnel * 3.0);

                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        colors.forEach((color, i) => {
            const geo = new THREE.TorusGeometry(radius + i * tube * 0.8, tube, 16, 100, Math.PI);

            const mat = new THREE.ShaderMaterial({
                vertexShader: rainbowVertexShader,
                fragmentShader: rainbowFragmentShader,
                uniforms: {
                    uColor: { value: color },
                    uOpacity: { value: 0.0 }
                },
                transparent: true,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending, // Glow effect
                depthWrite: false
            });

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.z = -10;
            this.group.add(mesh);
        });

        this.group.position.set(0, 0, -25);
    }

    update(time) {
        if (state.currentAct >= 3) {
            if (!this.group.visible) this.group.visible = true;

            this.group.children.forEach((mesh, i) => {
                const uniforms = mesh.material.uniforms;

                // Fade in
                if (uniforms.uOpacity.value < 0.3) {
                    uniforms.uOpacity.value += 0.001;
                }

                // Pulse
                const pulse = 0.3 + Math.sin(time * 0.002 + i * 0.5) * 0.05;
                if (uniforms.uOpacity.value >= 0.3) {
                     uniforms.uOpacity.value = pulse;
                }

                // Wiggle
                mesh.rotation.z = Math.sin(time * 0.0005 + i * 0.1) * 0.02;
            });
        }
    }
}
