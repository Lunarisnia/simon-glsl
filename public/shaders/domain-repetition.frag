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
    return sdCloud(p);
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    vec3 color = vec3(uv, 0.0);

    float d = repeated(pixelCoords - vec2(u_time * 200.0, 0.0), 800.0, 400.0);
    color = mix(vec3(1.0), color, d);

    gl_FragColor = vec4(color, 1.0);
}
