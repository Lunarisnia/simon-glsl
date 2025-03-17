varying vec2 vUv;
varying vec3 vPosition;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D tex;

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

float hash2D(vec2 p) // replace this by something better
{
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

// Source: https://www.shadertoy.com/view/4dffRH
vec3 hash(vec3 p) // this hash is not production ready, please
{ // replace this by something better
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
            dot(p, vec3(269.5, 183.3, 246.1)),
            dot(p, vec3(113.5, 271.9, 124.6)));

    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

vec4 filteredSample(sampler2D target, vec2 p) {
    vec2 texSize = vec2(2.0);
    vec2 pc = p * texSize - 0.5;
    vec2 base = floor(pc) + 0.5;

    vec4 s1 = texture2D(target, (base + vec2(0.0, 0.0)) / texSize);
    vec4 s2 = texture2D(target, (base + vec2(1.0, 0.0)) / texSize);
    vec4 s3 = texture2D(target, (base + vec2(0.0, 1.0)) / texSize);
    vec4 s4 = texture2D(target, (base + vec2(1.0, 1.0)) / texSize);

    vec2 f = fract(pc);

    vec4 px1 = mix(s1, s2, f.x);
    vec4 px2 = mix(s3, s4, f.x);
    vec4 result = mix(px1, px2, f.y);

    return result;
}

vec4 noise(vec2 p) {
    vec2 texSize = vec2(1.0);
    vec2 pc = p * texSize;
    vec2 base = floor(pc);

    float s1 = hash2D((base + vec2(0.0, 0.0)) / texSize);
    float s2 = hash2D((base + vec2(1.0, 0.0)) / texSize);
    float s3 = hash2D((base + vec2(0.0, 1.0)) / texSize);
    float s4 = hash2D((base + vec2(1.0, 1.0)) / texSize);

    vec2 f = smoothstep(0.0, 1.0, fract(pc));

    float px1 = mix(s1, s2, f.x);
    float px2 = mix(s3, s4, f.x);
    float result = mix(px1, px2, f.y);

    return vec4(vec3(result), 1.0);
}

float noise3D(in vec3 x)
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

// Looks like smoke
float fbm(vec3 p, int octaves, float persistence, float lacunarity) {
    float amplitude = 0.5;
    float frequency = 1.0;
    float total = 0.0;
    float normalization = 0.0;

    for (int i = 0; i < octaves; i++) {
        float noiseValue = noise3D(p * frequency);
        total += noiseValue * amplitude;

        normalization += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
    }

    total /= normalization;
    return total;
}

// Looks like worm or caustic on waters
float ridgedFbm(vec3 p, int octaves, float persistence, float lacunarity) {
    float amplitude = 0.5;
    float frequency = 1.0;
    float total = 0.0;
    float normalization = 0.0;

    for (int i = 0; i < octaves; i++) {
        float noiseValue = noise3D(p * frequency);
        noiseValue = 1.0 - abs(noiseValue);
        total += noiseValue * amplitude;

        normalization += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
    }

    total /= normalization;
    total *= total;
    return total;
}

float turbulenceFbm(vec3 p, int octaves, float persistence, float lacunarity) {
    float amplitude = 0.5;
    float frequency = 1.0;
    float total = 0.0;
    float normalization = 0.0;

    for (int i = 0; i < octaves; i++) {
        float noiseValue = noise3D(p * frequency);
        noiseValue = abs(noiseValue);
        total += noiseValue * amplitude;

        normalization += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
    }

    total /= normalization;
    return total;
}

float cellular(vec3 coords) {
    vec2 gridBasePosition = floor(coords.xy);
    vec2 gridBaseOffset = fract(coords.xy);

    float closest = 1.0;
    for (float y = -2.0; y <= 2.0; y += 1.0) {
        for (float x = -2.0; x <= 2.0; x += 1.0) {
            vec2 neighbourCellPosition = vec2(x, y);
            vec2 cellWorldPosition = gridBasePosition + neighbourCellPosition;
            vec2 cellOffset = vec2(
                    noise3D(vec3(cellWorldPosition, coords.z) + vec3(294.03, 938.0, 0.0)),
                    noise3D(vec3(cellWorldPosition, coords.z))
                );

            float distToNeighbour = length(neighbourCellPosition + cellOffset - gridBaseOffset);
            closest = min(closest, distToNeighbour);
        }
    }

    return closest;
}

float stepped(float noiseSample) {
    float steppedSample = floor(noiseSample * 10.0) / 10.0;
    float remainder = fract(noiseSample * 10.0);
    steppedSample = (steppedSample - remainder) * 0.5 + 0.5;
    return steppedSample;
}

float domainWarping(vec3 coords) {
    vec3 offset = vec3(
            fbm(coords, 8, 0.5, 2.0),
            fbm(coords + vec3(0.287, 383.0, 0.0), 4, 0.84, 2.0),
            0.0
        );
    float noiseSample = fbm(coords + offset, 8, 0.5, 2.0);

    vec3 offset2 = vec3(
            fbm(coords * 4.0 + vec3(391.0, 112.0, 0.0), 8, 0.5, 2.0),
            fbm(coords * 4.0 + vec3(999.287, 83.0, 0.0), 4, 0.84, 2.0),
            0.0
        );
    noiseSample = fbm(coords + 4.0 * offset2, 8, 0.5, 2.0);

    return noiseSample;
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    vec3 noiseX = vec3(vUv * 5.0, u_time * 0.25);
    // float noiseValue = remap(ridgedFbm(noiseX, 32, 0.5, 2.0), -1.0, 1.0, 0.0, 1.0);
    // float noiseValue = turbulenceFbm(noiseX, 32, 0.5, 2.0);
    // float noiseValue = cellular(noiseX);
    // noiseValue = stepped(noiseValue);
    // noiseValue = remap(domainWarping(noiseX), -1.0, 1.0, 0.0, 1.0);

    // float noiseValue = turbulenceFbm(noiseX, 32, 0.5, 2.0);

    vec3 baseColor = vec3(1.0, 25.0, 50.0) / 255.0;
    vec3 color = vec3(0.0);

    vec3 pixelSize = vec3(0.5 / u_resolution, 0.0);
    float s1 = fbm(noiseX + pixelSize.xzz, 8, 0.5, 2.0);
    float s2 = fbm(noiseX - pixelSize.xzz, 8, 0.5, 2.0);
    float s3 = fbm(noiseX + pixelSize.zyz, 8, 0.5, 2.0);
    float s4 = fbm(noiseX - pixelSize.zyz, 8, 0.5, 2.0);
    vec3 normal = normalize(vec3(s1 - s2, s3 - s4, 0.001));

    // Hemisphere light
    vec3 hemiColor1 = vec3(0.3);
    vec3 hemiColor2 = vec3(0.9);
    float remappedNormal = remap(normal.y, -1.0, 1.0, 0.0, 1.0);
    vec3 hemi = mix(hemiColor1, hemiColor2, remappedNormal);

    // Lambertian light
    vec3 lightColor = vec3(1.0, 0.0, 0.0);
    vec3 lightDirection = normalize(vec3(cos(u_time * 0.003), sin(u_time * 0.25), 1.0));
    float dp = max(0.0, dot(normal, lightDirection));
    vec3 lambertian = lightColor * dp;

    // Lightings
    vec3 lighting = hemi + lambertian;

    vec3 r = normalize(reflect(-lightDirection, normal));
    float phongValue = max(0.0, dot(vec3(0.0, 0.0, 1.0), r));
    phongValue = pow(phongValue, 64.0);

    // Speculars
    vec3 specular = vec3(phongValue);

    color = baseColor * lighting + specular;
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
}
