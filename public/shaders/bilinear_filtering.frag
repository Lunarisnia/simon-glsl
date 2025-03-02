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

    vec4 result = mix(mix(s1, s2, f.x), mix(s3, s4, f.x), f.y);

    return result;
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    // vec3 color = vec3(hash(vec2(pixelCoords.x / pixelCoords.y, u_time)));

    // gl_FragColor = vec4(color, 1.0);
    gl_FragColor = filteredSample(tex, uv);
}
