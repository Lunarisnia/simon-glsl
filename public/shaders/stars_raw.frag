varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

// Source: https://www.shadertoy.com/view/4dffRH
vec3 hash(vec3 p) // this hash is not production ready, please
{ // replace this by something better
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
            dot(p, vec3(269.5, 183.3, 246.1)),
            dot(p, vec3(113.5, 271.9, 124.6)));

    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

vec3 GenerateGridStars(vec2 pixelCoords, float cellWidth, float starRadius, float seed) {
    vec2 cellCoords = (fract(pixelCoords / cellWidth) - 0.5) * cellWidth;
    vec2 cellID = floor(pixelCoords / cellWidth) + (seed / 100.0);
    vec3 cellHashValue = hash(vec3(cellID, 0.0));

    float starBrightness = clamp(cellHashValue.z, 0.0, 1.0);
    vec2 starPosition = vec2(0.0) + cellHashValue.xy * (cellWidth * 0.5 - starRadius * 4.0);
    float distToCell = length(cellCoords - starPosition);
    float glow = exp(-2.0 * distToCell / starRadius);

    return vec3(glow * starBrightness);
}

vec3 GenerateStars(vec2 pixelCoords) {
    vec3 stars = vec3(0.0);
    float cellWidth = 700.0;
    float starRadius = 10.0;

    for (float i = 0.0; i < 5.0; i += 1.0) {
        stars += GenerateGridStars(pixelCoords, cellWidth, starRadius, i);

        cellWidth *= 0.5;
        starRadius *= 0.75;
    }

    return stars;
}

void main() {
    vec2 uv = vUv;
    vec2 pc = (uv - 0.5) * u_resolution;

    float st = pc.y;

    vec3 stars = GenerateStars(pc);
    vec3 color = vec3(mix(vec3(0.0), stars, smoothstep(0.2, 1.0, uv.y)));

    gl_FragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.0);
}
