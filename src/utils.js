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
    varying vec3 vViewPosition;

    void main() {
        vUv = uv;
        vec3 pos = position;

        // Complex wave equation for organic movement
        float elevation = sin(pos.x * 3.0 + uTime * 0.8) * 0.08;
        elevation += sin(pos.y * 2.5 + uTime * 0.6) * 0.08;
        elevation += sin((pos.x + pos.y) * 4.0 + uTime * 1.2) * 0.04;

        // Small ripples
        elevation += sin(sqrt(pos.x*pos.x + pos.y*pos.y) * 10.0 - uTime * 2.0) * 0.02;

        pos.z += elevation;
        vElevation = elevation;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vViewPosition = -mvPosition.xyz;
    }
`;

export const WATER_FRAGMENT_SHADER = `
    uniform float uTime;
    uniform vec3 uColor;      // Shallow color
    uniform vec3 uDeepColor;  // Deep color

    varying vec2 vUv;
    varying float vElevation;
    varying vec3 vViewPosition;

    void main() {
        // Calculate normal using derivatives for flat shading look or smooth waves
        vec3 xTangent = dFdx(vViewPosition);
        vec3 yTangent = dFdy(vViewPosition);
        vec3 normal = normalize(cross(xTangent, yTangent));

        // View direction
        vec3 viewDir = normalize(vViewPosition);

        // Fresnel effect (reflection intensity based on angle)
        float fresnel = dot(viewDir, normal);
        fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
        fresnel = pow(fresnel, 2.0); // Adjust power for glassiness

        // Mix Deep and Shallow colors based on elevation and noise
        vec3 waterColor = mix(uDeepColor, uColor, vElevation * 3.0 + 0.5);

        // Specular highlight (fake sun reflection)
        vec3 lightDir = normalize(vec3(0.5, 0.8, 0.5));
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

        // Foam/Sparkles on peaks
        float sparkle = step(0.12, vElevation);

        vec3 finalColor = waterColor + (fresnel * 0.3) + (spec * 0.6) + (sparkle * 0.1);

        // Alpha: More transparent when looking straight down, more opaque at angle
        float alpha = 0.6 + fresnel * 0.4;

        gl_FragColor = vec4(finalColor, alpha);

        #include <tonemapping_fragment>
        #include <colorspace_fragment>
    }
`;
