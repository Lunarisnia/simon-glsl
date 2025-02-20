varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    float t = uv.x;
    float width = 2.0;

    vec3 red = vec3(1.0, 0.0, 0.0);
    vec3 green = vec3(0.0, 1.0, 0.0);
    vec3 blue = vec3(0.0, 0.0, 1.0);
    vec3 yellow = vec3(1.0, 1.0, 0.0);
    vec3 purple = vec3(0.5, 0.0, 1.0);

    vec3 color = mix(red, green, step(width / 10.0, t));
    color = mix(color, blue, step(width * 2.0 / 10.0, t));
    color = mix(color, yellow, step(width * 3.0 / 10.0, t));
    color = mix(color, purple, step(width * 4.0 / 10.0, t));

    gl_FragColor = vec4(color, 1.0);
}
