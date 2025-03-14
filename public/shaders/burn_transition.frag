varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D diffuse;
uniform sampler2D tex;

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

float sdCircle(vec2 p, float radius) {
    return length(p) - radius;
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    float noiseSample = fbm(vec3(pixelCoords, 0.0) * 0.005, 8, 0.5, 2.0);

    float size = smoothstep(0.0, 15.0, u_time) * length(u_resolution) * 0.5;
    float c1 = sdCircle(pixelCoords + (100.0 * noiseSample), size);

    vec2 distortion = noiseSample / u_resolution;
    vec2 uvDistortion = distortion * 200.0 * smoothstep(180.0, 20.0, c1);

    vec3 image1 = texture2D(diffuse, uv + uvDistortion).xyz;
    vec3 image2 = texture2D(tex, uv).xyz;

    vec3 color = image1;

    // Shaping function to make darkening effect
    float shadowAmount = 1.0 - exp(-c1 * c1 * 0.001);
    color = mix(vec3(0.0), color, shadowAmount);

    vec3 fireColor = vec3(1.0, 0.5, 0.2);
    float fireAmount = smoothstep(0.0, 30.0, c1);
    fireAmount = pow(fireAmount, 0.25);

    color = mix(fireColor, color, fireAmount);

    color = mix(image2, color, smoothstep(0.0, 15.0, c1));

    // Add glow
    float glowAmount = smoothstep(0.0, 32.0, abs(c1));
    glowAmount = 1.0 - pow(glowAmount, 0.125);
    color += glowAmount * vec3(1.0, 0.2, 0.05);

    gl_FragColor = vec4(color, 1.0);
}
