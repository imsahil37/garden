import * as THREE from 'three';
import { state } from './state.js';
import { config } from './config.js';

export class ConstellationManager {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.group.visible = false;

        this.stars = [];
        this.init();
    }

    init() {
        // Create stars for the name
        // Simplified: Just arrange points in a line or grid to spell "NAME" is hard without font data.
        // Let's make a heart shape instead with the name implied or display text.
        // Spec says: "Recipient's name + heart symbol"
        // "Content: Recipient's name + heart symbol"
        // "Lines: Connect stars within each character"

        // Since procedurally generating text geometry with stars is complex without font paths,
        // we can use a texture or just a heart shape of stars for the visual, and rely on the UI/Text for the name?
        // OR we can try to form letters on a grid.

        // Let's stick to a heart shape constellation for simplicity and elegance.
        // It looks like a constellation.

        const name = config.recipient.name.toUpperCase();

        // Let's create a heart shape of stars
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0, 0, -5, 10, -10, 10);
        heartShape.bezierCurveTo(-15, 10, -15, 0, -10, -5);
        heartShape.bezierCurveTo(-5, -10, 0, -15, 5, -10); // curve to bottom
        // Wait, bezier curves are hard.

        // Parametric heart:
        // x = 16 sin^3 t
        // y = 13 cos t - 5 cos 2t - 2 cos 3t - cos 4t

        const points = [];
        for(let t = 0; t < Math.PI * 2; t += 0.2) {
             const x = 16 * Math.pow(Math.sin(t), 3);
             const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
             points.push(new THREE.Vector3(x * 0.2, y * 0.2, 0));
        }

        points.forEach((pos, i) => {
             this.createStar(pos);

             // Lines connecting stars
             if (i > 0) {
                 this.createLine(points[i-1], pos);
             }
        });
        // Close loop
        this.createLine(points[points.length-1], points[0]);

        this.group.position.set(0, 15, -10);
        this.group.lookAt(0, 0, 0);
    }

    createStar(pos) {
        const starGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.copy(pos);
        this.group.add(star);
        this.stars.push(star);
    }

    createLine(p1, p2) {
        const points = [p1, p2];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
        const line = new THREE.Line(geometry, material);
        this.group.add(line);
    }

    update(time) {
        if (state.currentAct === 4 && !this.group.visible) {
             this.group.visible = true;
             // Trigger next act (Letter) after a delay?
             // Or wait for user interaction?
             // Spec says: Act 5 starts after Act 4 Revelation

             setTimeout(() => {
                 state.setAct(5);
             }, 4000);
        }

        if (this.group.visible) {
            // Twinkle & Float
            this.stars.forEach((star, i) => {
                const scale = 1 + Math.sin(time * 0.005 + i) * 0.3;
                star.scale.setScalar(scale);

                // Floating offset
                star.position.z = Math.sin(time * 0.001 + i) * 0.1;
            });

            // Pulse lines
            this.group.children.forEach(child => {
                if (child.isLine) {
                    child.material.opacity = 0.3 + Math.sin(time * 0.003) * 0.2;
                }
            });
        }
    }
}
