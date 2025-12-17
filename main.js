import './style.css';
import { SceneManager } from './src/scene.js';
import { UIManager } from './src/ui.js';
import { state } from './src/state.js';
import { LoadingManager } from './src/loading.js';
import { AudioManager } from './src/audio.js';
import { RaycasterManager } from './src/raycaster.js';
import { OrbsManager } from './src/orbs.js';
import { FlowersManager } from './src/flowers.js';
import { TreeManager } from './src/tree.js';
import { RainbowManager } from './src/rainbow.js';
import { ConstellationManager } from './src/constellation.js';
import { LetterManager } from './src/letter.js';
import { ChoiceManager } from './src/choice.js';
import { FirefliesManager } from './src/fireflies.js';
import { ParticlesManager } from './src/particles.js';
import { MobileManager } from './src/mobile.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        // Mobile check
        this.mobile = new MobileManager();

        // Initialize managers
        this.ui = new UIManager();
        this.loading = new LoadingManager();
        this.scene = new SceneManager();
        this.audio = new AudioManager();
        this.raycaster = new RaycasterManager(this.scene.camera, this.scene.scene);

        // Scene Objects
        this.flowers = new FlowersManager(this.scene.scene);
        this.orbs = new OrbsManager(this.scene.scene, this.ui, this.flowers);
        this.tree = new TreeManager(this.scene.scene);
        this.rainbow = new RainbowManager(this.scene.scene);
        this.constellation = new ConstellationManager(this.scene.scene);
        this.fireflies = new FirefliesManager(this.scene.scene);
        this.particles = new ParticlesManager(this.scene.scene);

        // Flow Managers
        this.letter = new LetterManager();
        this.choice = new ChoiceManager();

        // Bind resize event
        window.addEventListener('resize', this.onResize.bind(this));

        // Start render loop
        this.animate();

        // Listen for start event from loading screen
        state.on('start', () => {
            this.audio.init();
            this.scene.start();
        });

        // Setup raycaster interaction
        document.addEventListener('click', (e) => this.raycaster.onClick(e));
        document.addEventListener('mousemove', (e) => this.raycaster.onMouseMove(e));

        // Connect raycaster to scene objects
        this.raycaster.setObjects(this.orbs.getInteractables());
    }

    onResize() {
        this.scene.onResize();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = performance.now();

        this.scene.update(time);
        this.raycaster.update();

        this.orbs.update(time);
        this.flowers.update(time);
        this.tree.update(time);
        this.rainbow.update(time);
        this.constellation.update(time);
        this.fireflies.update(time);
        this.particles.update(time);
    }
}

// Start the app
const app = new App();
window.gardenApp = app;
window.gardenState = state;
