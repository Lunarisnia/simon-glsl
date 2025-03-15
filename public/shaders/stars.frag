varying vec2 vUv;

uniform float u_time;
uniform vec2 u_resolution;

// Source: https://www.shadertoy.com/view/4dffRH
vec3 hash(vec3 p) // this hash is not production ready, please
{ // replace this by something better
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
            dot(p, vec3(269.5, 183.3, 246.1)),
            dot(p, vec3(113.5, 271.9, 124.6)));

    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec3 x)
{
    // grid
    vec3 p = floor(x);
    vec3 w = fract(x);

    // quintic interpolant
    vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);

    // gradients
    vec3 ga = hash(p + vec3(0.0, 0.0, 0.0));
    vec3 gb = hash(p + vec3(1.0, 0.0, 0.0));
    vec3 gc = hash(p + vec3(0.0, 1.0, 0.0));
    vec3 gd = hash(p + vec3(1.0, 1.0, 0.0));
    vec3 ge = hash(p + vec3(0.0, 0.0, 1.0));
    vec3 gf = hash(p + vec3(1.0, 0.0, 1.0));
    vec3 gg = hash(p + vec3(0.0, 1.0, 1.0));
    vec3 gh = hash(p + vec3(1.0, 1.0, 1.0));

    // projections
    float va = dot(ga, w - vec3(0.0, 0.0, 0.0));
    float vb = dot(gb, w - vec3(1.0, 0.0, 0.0));
    float vc = dot(gc, w - vec3(0.0, 1.0, 0.0));
    float vd = dot(gd, w - vec3(1.0, 1.0, 0.0));
    float ve = dot(ge, w - vec3(0.0, 0.0, 1.0));
    float vf = dot(gf, w - vec3(1.0, 0.0, 1.0));
    float vg = dot(gg, w - vec3(0.0, 1.0, 1.0));
    float vh = dot(gh, w - vec3(1.0, 1.0, 1.0));

    // interpolation
    return va +
        u.x * (vb - va) +
        u.y * (vc - va) +
        u.z * (ve - va) +
        u.x * u.y * (va - vb - vc + vd) +
        u.y * u.z * (va - vc - ve + vg) +
        u.z * u.x * (va - vb - ve + vf) +
        u.x * u.y * u.z * (-va + vb + vc - vd + ve - vf - vg + vh);
}

float fbm(vec3 p, int octaves, float persistence, float lacunarity) {
    float amplitude = 0.5;
    float frequency = 1.0;
    float total = 0.0;
    float normalization = 0.0;

    for (int i = 0; i < octaves; i++) {
        float noiseValue = noise(p * frequency);
        total += noiseValue * amplitude;

        normalization += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
    }

    total /= normalization;
    return total;
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

float sdCircle(vec2 p, float radius) {
    return length(p) - radius;
}

vec3 DrawPlanet(vec2 pixelCoords, vec3 color) {
    float planetRadius = 600.0;

    float d = sdCircle(pixelCoords, planetRadius);

    vec3 planetColor = vec3(1.0);
    if (d <= 0.0) {
        vec2 pc = pixelCoords;
        float x = pc.x / planetRadius;
        float y = pc.y / planetRadius;
        float z = sqrt(1.0 - x * x - y * y);
        vec3 viewNormal = vec3(x, y, z);
        vec3 wsPosition = viewNormal;

        vec3 noiseCoord = wsPosition * 2.0;
        float noiseSample = fbm(noiseCoord + vec3(120.0), 10, 0.59, 2.0);
        float desertSample = fbm(noiseCoord * 0.5 + vec3(20.0), 8, 0.5, 2.0);

        vec3 landColor = mix(vec3(0.3, 0.8443, 0.44), vec3(0.884, 0.994, 0.8290), smoothstep(0.05, 1.0, noiseSample));
        landColor = mix(vec3(0.8, 0.8, 0.6), landColor, smoothstep(0.03, 0.06, desertSample));
        landColor = mix(landColor, vec3(0.4), smoothstep(0.1, 0.2, noiseSample));
        landColor = mix(landColor, vec3(1.0), smoothstep(0.2, 0.3, noiseSample));
        landColor = mix(landColor, vec3(0.9), smoothstep(0.4, 0.9, abs(viewNormal.y)));

        vec3 seaColor = mix(vec3(0.0, 0.0, 1.0), vec3(0.8479, 0.8984, 0.99823), smoothstep(0.002, 0.06, noiseSample));

        planetColor = mix(seaColor, landColor, smoothstep(0.03, 0.06, noiseSample));
    }

    color = mix(color, planetColor, smoothstep(0.0, -1.0, d));

    return color;
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    vec3 color = vec3(0.0);
    color = GenerateStars(pixelCoords);
    color = DrawPlanet(pixelCoords, color);

    gl_FragColor = vec4(color, 1.0);
}
