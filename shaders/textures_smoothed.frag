varying vec2 vUv;

uniform sampler2D diffuse;

void main() {
    vec2 uv = vUv;

    vec4 color = texture2D(diffuse, uv);
    // color.x = smoothstep(0.0, 1.0, uv.x);

    gl_FragColor = smoothstep(vec4(0.0), vec4(1.0), color);
}
