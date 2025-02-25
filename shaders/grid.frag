varying vec2 vUv;

uniform vec2 u_resolution;

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

vec3 drawVignette() {
    float distToCenter = length(abs(vUv - 0.5));

    float invertedDist = 1.0 - distToCenter;
    invertedDist = smoothstep(0.05, 0.6, invertedDist);
    invertedDist = remap(invertedDist, 0.0, 1.0, 0.3, 1.0);

    return vec3(invertedDist);
}

vec3 drawGrid(vec3 color, vec3 gridColor, float cellSpacing, float lineWidth) {
    vec2 center = vUv - 0.5;
    vec2 cell = fract(center * u_resolution / cellSpacing);
    cell = abs(cell - 0.5);

    float distToCell = (0.5 - max(cell.x, cell.y)) * cellSpacing;

    float gridLine = smoothstep(0.0, lineWidth, distToCell);

    vec3 grid = mix(gridColor, color, gridLine);
    return grid;
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    vec3 color = drawVignette();
    color = drawGrid(color, vec3(0.6), 10.0, 1.0);
    color = drawGrid(color, vec3(0.0), 100.0, 3.0);

    gl_FragColor = vec4(color, 1.0);
}
