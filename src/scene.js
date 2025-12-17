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
        const starsCount = 1200;
        const posArray = new Float32Array(starsCount * 3);

        for(let i = 0; i < starsCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 100;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });

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

        // Rotate stars
        if (this.stars) {
            this.stars.rotation.y = time * 0.00005;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
