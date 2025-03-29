varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = vUv;
    vec2 pc = (uv - 0.5) * u_resolution;

    vec3 color = vec3(uv, 0.0);

    gl_FragColor = vec4(color, 1.0);
}
