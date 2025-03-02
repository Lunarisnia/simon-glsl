varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D tex;

float hash(vec2 p) // replace this by something better
{
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
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

    float s1 = hash((base + vec2(0.0, 0.0)) / texSize);
    float s2 = hash((base + vec2(1.0, 0.0)) / texSize);
    float s3 = hash((base + vec2(0.0, 1.0)) / texSize);
    float s4 = hash((base + vec2(1.0, 1.0)) / texSize);

    vec2 f = smoothstep(0.0, 1.0, fract(pc));

    float px1 = mix(s1, s2, f.x);
    float px2 = mix(s3, s4, f.x);
    float result = mix(px1, px2, f.y);

    return vec4(vec3(result), 1.0);
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    gl_FragColor = noise(uv * 20.0);
}
