import * as THREE from 'three';
import { state } from './state.js';

export class RaycasterManager {
    constructor(camera, scene) {
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.camera = camera;
        this.scene = scene;
        this.interactiveObjects = [];
        this.hoveredObject = null;
    }

    setObjects(objects) {
        this.interactiveObjects = objects;
    }

    addObject(object) {
        this.interactiveObjects.push(object);
    }

    onMouseMove(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onClick(event) {
        if (this.hoveredObject && this.hoveredObject.userData.onClick) {
            this.hoveredObject.userData.onClick();
        }
    }

    update() {
        this.raycaster.setFromCamera(this.pointer, this.camera);

        // Filter out objects that shouldn't be interactable based on state (e.g. if overlay is open)
        // For now, assume all in list are candidates

        const intersects = this.raycaster.intersectObjects(this.interactiveObjects, false); // false for recursive? usually true if objects are groups
        // Wait, intersectsObjects(objects, recursive). We probably want recursive if we pass groups.
        // But let's pass Mesh objects directly if possible, or handle bubbling.

        if (intersects.length > 0) {
            // Find the first object that has a handler
            let target = intersects[0].object;
            // Traverse up if needed, or assume userData is on the mesh
             while(target && !target.userData.isInteractable && target.parent) {
                 target = target.parent;
             }

             if (target && target.userData.isInteractable) {
                 if (this.hoveredObject !== target) {
                     if (this.hoveredObject && this.hoveredObject.userData.onPointerOut) {
                         this.hoveredObject.userData.onPointerOut();
                     }
                     this.hoveredObject = target;
                     if (this.hoveredObject.userData.onPointerOver) {
                         this.hoveredObject.userData.onPointerOver();
                     }
                     document.body.style.cursor = 'pointer';
                 }
             } else {
                 this.handlePointerOut();
             }
        } else {
            this.handlePointerOut();
        }
    }

    handlePointerOut() {
        if (this.hoveredObject) {
            if (this.hoveredObject.userData.onPointerOut) {
                this.hoveredObject.userData.onPointerOut();
            }
            this.hoveredObject = null;
            document.body.style.cursor = 'default';
        }
    }
}
