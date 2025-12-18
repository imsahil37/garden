import * as THREE from 'three';
import { ControlsManager } from './controls.js';
import { LightsManager } from './lights.js';
import { Island } from './island.js';
import { state } from './state.js';

export class SceneManager {
    constructor() {
        this.canvas = document.querySelector('#canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.lights = null;
        this.island = null;
        this.raycasterObjects = [];

        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a15); // Dark background
        this.scene.fog = new THREE.FogExp2(0x0a0a15, 0.02);

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 15);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Components
        this.controls = new ControlsManager(this.camera, this.canvas);
        this.lights = new LightsManager(this.scene);
        this.island = new Island(this.scene);

        // Stars
        this.addStars();
    }

    addStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 2000;
        const posArray = new Float32Array(starsCount * 3);
        const randomArray = new Float32Array(starsCount);
        const sizeArray = new Float32Array(starsCount);

        for(let i = 0; i < starsCount; i++) {
            posArray[i*3] = (Math.random() - 0.5) * 100;
            posArray[i*3+1] = (Math.random() - 0.5) * 60 + 20; // Bias upwards
            posArray[i*3+2] = (Math.random() - 0.5) * 100;

            randomArray[i] = Math.random(); // Used for twinkle and reveal timing
            sizeArray[i] = 0.5 + Math.random() * 1.5;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        starsGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randomArray, 1));
        starsGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizeArray, 1));

        const starsMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uRevealProgress: { value: 0.1 } // Start with few stars
            },
            vertexShader: `
                uniform float uTime;
                attribute float aRandom;
                attribute float aSize;
                varying float vAlpha;

                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    gl_PointSize = aSize * (50.0 / -mvPosition.z);

                    // Twinkle effect
                    float twinkle = 0.5 + 0.5 * sin(uTime * 1.5 + aRandom * 10.0);
                    vAlpha = twinkle;
                }
            `,
            fragmentShader: `
                uniform float uRevealProgress;
                varying float vAlpha;

                void main() {
                    // Circular point
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    if(length(coord) > 0.5) discard;

                    // Reveal logic based on random threshold
                    // Using gl_FragCoord or a varying for consistent reveal wouldn't work as well as random
                    // We can pass a varying for threshold, but since we want density to increase,
                    // we can just use aRandom < uRevealProgress logic in fragment or vertex.
                    // Doing it in alpha:

                    gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        // I realized I need to access aRandom in fragment shader for the reveal logic
        // Let's rewrite the shaders properly
        starsMaterial.vertexShader = `
            uniform float uTime;
            attribute float aRandom;
            attribute float aSize;
            varying float vAlpha;
            varying float vRandom;

            void main() {
                vRandom = aRandom;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = aSize * (50.0 / -mvPosition.z);

                // Twinkle
                vAlpha = 0.7 + 0.3 * sin(uTime * 2.0 + aRandom * 10.0);
            }
        `;

        starsMaterial.fragmentShader = `
            uniform float uRevealProgress;
            varying float vAlpha;
            varying float vRandom;

            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if(dist > 0.5) discard;

                // Glow falloff
                float glow = 1.0 - (dist * 2.0);
                glow = pow(glow, 1.5);

                // Check reveal
                float visibility = smoothstep(uRevealProgress - 0.1, uRevealProgress, vRandom);
                // Invert so low random values appear first? Or high?
                // Let's say we want them to appear as uRevealProgress goes 0 -> 1.
                // We show stars where vRandom < uRevealProgress

                float revealed = step(vRandom, uRevealProgress);

                // Add a smooth fade in at the edge of the reveal
                // But simple step is fine for "number increasing"

                gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha * glow * revealed);
            }
        `;

        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }

    start() {
        // Transition from loading to Act 1
        state.isLoaded = true;
        // Animation to start position or anything specific
    }

    setRaycasterObjects(raycasterManager) {
        // Define which objects can be interacted with
        // For now, it's just the orbs (which we haven't added yet)
        // This method will be called by main.js, and we'll delegate to sub-managers
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update(time) {
        this.controls.update();
        this.lights.update();
        this.island.update(time);

        // Rotate stars and update uniforms
        if (this.stars) {
            this.stars.rotation.y = time * 0.00005;
            this.stars.material.uniforms.uTime.value = time * 0.001;

            // Slowly increase star count
            // Start at 0.1, go to 1.0 over ~60 seconds (or faster in later acts)
            // Or just continuous increase
            const current = this.stars.material.uniforms.uRevealProgress.value;
            if (current < 1.0) {
                 this.stars.material.uniforms.uRevealProgress.value += 0.0003;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}
