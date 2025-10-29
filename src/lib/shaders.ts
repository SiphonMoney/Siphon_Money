export const simulationVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const simulationFragmentShader = `
uniform sampler2D textureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform int frame;
varying vec2 vUv;

const float delta = 1.4;  

void main() {
    vec2 uv = vUv;
    if (frame == 0) {
        gl_FragColor = vec4(0.0);
        return;
    }
    
    vec4 data = texture2D(textureA, uv);
    float pressure = data.x;
    float pVel = data.y;
    
    vec2 texelSize = 1.0 / resolution;
    float p_right = texture2D(textureA, uv + vec2(texelSize.x, 0.0)).x;
    float p_left = texture2D(textureA, uv + vec2(-texelSize.x, 0.0)).x;
    float p_up = texture2D(textureA, uv + vec2(0.0, texelSize.y)).x;
    float p_down = texture2D(textureA, uv + vec2(0.0, -texelSize.y)).x;
    
    if (uv.x <= texelSize.x) p_left = p_right;
    if (uv.x >= 1.0 - texelSize.x) p_right = p_left;
    if (uv.y <= texelSize.y) p_down = p_up;
    if (uv.y >= 1.0 - texelSize.y) p_up = p_down;
    
    // Enhanced wave equation matching ShaderToy
    pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
    pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;
    
    pressure += delta * pVel;
    
    pVel -= 0.008 * delta * pressure;  // Increased damping for faster fade
    
    pVel *= 1.0 - 0.003 * delta;  // Increased damping
    pressure *= 0.995;  // Faster decay for more subtle effect
    
    vec2 mouseUV = mouse / resolution;
    if(mouse.x > 0.0) {
        float dist = distance(uv, mouseUV);
        if(dist <= 0.02) {  // Smaller radius for more precise ripples
            pressure += 1.0 * (1.0 - dist / 0.02);  // Reduced intensity for subtlety
        }
    }
    
    gl_FragColor = vec4(pressure, pVel, 
        (p_right - p_left) / 2.0, 
        (p_up - p_down) / 2.0);
}
`;

export const renderVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const renderFragmentShader = `
uniform sampler2D textureA;
uniform sampler2D textureB;
uniform vec2 resolution;
uniform float time;
varying vec2 vUv;

// Noise function for organic patterns
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Fractal noise for organic burns
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

void main() {
    vec4 data = texture2D(textureA, vUv);
    
    // Much smaller pixelation effect
    float pixelSize = 0.8 + sin(time * 3.0) * 0.4;
    vec2 pixelatedUV = floor(vUv * resolution / pixelSize) * pixelSize / resolution;
    
    vec2 distortion = 0.15 * data.zw;  // Reduced distortion for lighter, more subtle effect
    vec4 color = texture2D(textureB, pixelatedUV + distortion);
    
    // Clean black background with water distortion effect
    vec3 finalColor = color.rgb;
    
    // Add pixel noise (reduced for lighter effect)
    vec2 noiseUV = floor(vUv * resolution / pixelSize) * pixelSize / resolution;
    float noise = fract(sin(dot(noiseUV, vec2(12.9898, 78.233))) * 43758.5453);
    noise = step(0.98, noise) * 0.1;  // Reduced noise intensity
    finalColor += vec3(noise * 0.3);  // Reduced noise contribution
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;


