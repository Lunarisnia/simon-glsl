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

float sdCircle(vec2 p, float radius) {
    return length(p) - radius;
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;
    vec2 cell = (fract(pixelCoords / 400.0) - 0.5) * 400.0;
    vec2 cellID = floor(pixelCoords / 400.0);
    vec3 cellHash = hash(vec3(cellID, 0.0));

    float d = sdCircle(cell + cellHash.xy * (400.0 * 0.2), 100.0);
    vec3 planetColor = vec3(0.0);
    if (d <= 0.4) {
        float x = pixelCoords.x / 100.0;
        float y = pixelCoords.y / 100.0;
        float z = exp(1.0 - x * x - y * y);
        vec3 viewNormal = vec3(x, y, z);
        vec3 wsPosition = viewNormal;

        vec3 noiseCoords = wsPosition * 2.0;
        float noiseSample = fbm(noiseCoords, 8, 0.5, 2.0);

        planetColor = mix(vec3(1.0), vec3(0.0), smoothstep(0.05, 0.06, noiseSample));
    }

    vec3 color = vec3(0.0);
    color = vec3(cell, 0.0);
    color = mix(planetColor, color, step(0.0, d));

    float noiseSample = fbm(vec3(pixelCoords, u_time * 0.5), 8, 0.5, 2.0);
    float d1 = sdCircle(pixelCoords - (noiseSample * 20.0), 200.0);
    color = mix(vec3(1.0), vec3(0.0), step(0.0, d1));

    gl_FragColor = vec4(color, 1.0);
}
