varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

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

vec3 drawBackground() {
    vec3 topSky = vec3(8.0, 98.0, 201.0) / 255.0;
    vec3 bottomSky = vec3(100, 194, 244) / 255.0;

    vec3 color = mix(bottomSky, topSky, smoothstep(0.8, 1.0, vUv.y));
    return color;
}

vec3 drawMountain(vec3 color, vec3 mountainColor, vec2 p, float depth) {
    vec3 bottomSky = vec3(100, 194, 244) / 255.0;

    float fogFactor = smoothstep(0.0, 8000.0, depth) * 0.5;

    float heightFactor = smoothstep(256.0, -512.0, p.y);
    heightFactor *= heightFactor;
    fogFactor = mix(heightFactor, fogFactor, fogFactor);

    mountainColor = mix(mountainColor, bottomSky, smoothstep(0.0, 8000.0, depth) * 0.5);

    float sdMountain = p.y - (fbm(vec3(depth + p.x / 256.0, 22.380, 3.0), 8, 0.5, 2.0) * 256.0);
    float blur = 1.0 + smoothstep(200.0, 6000.0, depth) * 128.0 + smoothstep(200.0, -1400.0, depth) * 128.0;
    color = mix(mountainColor, color, smoothstep(0.0, blur, sdMountain));

    return color;
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    vec3 color = drawBackground();

    vec2 animationOffset = vec2(u_time * 200.0, 0.0);
    vec2 mountainPos = (pixelCoords - vec2(0.0, 400.0)) * 8.0 + animationOffset;
    color = drawMountain(color, vec3(0.6), mountainPos, 8000.0);

    vec2 mountainPos2 = (pixelCoords - vec2(0.0, 250.0)) * 2.0 + animationOffset;
    color = drawMountain(color, vec3(0.5), mountainPos2, 2000.0);

    vec2 mountainPos3 = (pixelCoords - vec2(0.0, 0.0)) * 1.0 + animationOffset;
    color = drawMountain(color, vec3(0.4), mountainPos3, 1000.0);

    vec2 mountainPos4 = (pixelCoords - vec2(0.0, -250.0)) * 0.5 + animationOffset;
    color = drawMountain(color, vec3(0.3), mountainPos4, 0.0);

    vec2 mountainPos5 = (pixelCoords - vec2(0.0, -500.0)) * 0.25 + animationOffset;
    color = drawMountain(color, vec3(0.1), mountainPos5, -200.0);

    gl_FragColor = vec4(color, 1.0);
}
