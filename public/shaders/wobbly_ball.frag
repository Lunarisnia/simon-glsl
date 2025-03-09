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

float sdBlob(vec2 p, float radius, float noiseInfluence, float noiseSpeed) {
    float noiseSample = fbm(vec3(p, u_time * noiseSpeed) * 0.004, 8, 0.5, 2.0);
    float d = sdCircle(p + (noiseInfluence * noiseSample), 400.0);
    return d;
}

float sdUnion(float a, float b) {
    return min(a, b);
}

float softMax(float a, float b, float k) {
    return log(exp(k * a) + exp(k * b)) / k;
}

float softMin(float a, float b, float k) {
    return -softMax(-a, -b, k);
}

float softMinValue(float a, float b, float k) {
    return exp(-b * k) / (exp(-a * k) + exp(-b * k));
}

void main() {
    vec2 uv = vUv;
    vec2 pc = (uv - 0.5) * u_resolution;

    float d = sdBlob(pc - vec2(sin(u_time) * 800.0, 0.0), 400.0, 180.0, 250.0);
    float d2 = sdBlob(pc + vec2(sin(u_time) * 800.0, 0.0), 400.0, 180.0, 250.0);
    float dU = softMin(d, d2, 0.008);
    vec3 sdfColor = mix(vec3(0.6, 0.12, 0.3), vec3(0.12, 0.6, 0.3), smoothstep(0.0, 1.0, softMinValue(d, d2, 0.01)));

    vec3 color = vec3(0.0, 0.2, 0.3);
    // color = mix(vec3(0.6, 0.12, 0.3), color, step(0.5, shadow));
    // color = mix(vec3(0.12, 0.6, 0.3), color, step(0.0, d2));
    color = mix(sdfColor, color, step(0.0, dU));

    gl_FragColor = vec4(color, 1.0);
}
