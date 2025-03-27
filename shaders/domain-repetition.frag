varying vec2 vUv;

uniform float u_time;
uniform vec2 u_resolution;

float sdCircle(vec2 pc, float radius) {
    return length(pc) - radius;
}

float sdCloud(vec2 pc) {
    float c1 = step(0.0, sdCircle(pc, 200.0));
    float c2 = step(0.0, sdCircle(pc - vec2(200.0, 0.0), 130.0));
    float c3 = step(0.0, sdCircle(pc - vec2(-200.0, 0.0), 130.0));
    return c1 * c2 * c3;
}

float repeated(vec2 p, float s, float sY) {
    p.x = p.x - s * round(p.x / s);
    p.y = p.y - sY * round(p.y / sY);
    return sdCircle(p, 100.0);
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    vec3 color = vec3(uv, 0.0);

    float d = repeated(pixelCoords, 800.0, 400.0);

    if (d >= 0.0) {
        color = vec3(0.5);
    }
    color *= 0.8 + 0.2 * cos(0.5 * d);
    color = mix(vec3(1.0), color, smoothstep(0.0, 1.0, abs(d)));

    gl_FragColor = vec4(color, 1.0);
}
