varying vec2 vUv;

uniform float u_time;

void main() {
    vec2 uv = vUv;

    float t = sin(u_time);

    gl_FragColor = vec4(vec3(t), 1.0);
}
