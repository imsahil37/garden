// Procedural texture generation to add detail without external assets
export function createNoiseTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 50 + 200; // Light noise
        data[i] = val;
        data[i+1] = val;
        data[i+2] = val;
        data[i+3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

export const WATER_VERTEX_SHADER = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
        vUv = uv;

        vec3 pos = position;

        // Simple wave equation
        float elevation = sin(pos.x * 2.0 + uTime * 0.5) * 0.1;
        elevation += sin(pos.y * 1.5 + uTime * 0.3) * 0.1;

        pos.z += elevation; // Move in Z (since plane is rotated)
        vElevation = elevation;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

export const WATER_FRAGMENT_SHADER = `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
        // Mix color based on elevation for depth effect
        vec3 color = mix(uColor, uColor + 0.2, vElevation * 2.0 + 0.5);

        // Add artificial specular/shine
        float shine = step(0.9, sin(vUv.x * 20.0 + uTime) * sin(vUv.y * 20.0 + uTime));
        color += shine * 0.2;

        gl_FragColor = vec4(color, 0.8);
    }
`;
