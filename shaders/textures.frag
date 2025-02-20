varying vec2 vUv;

uniform sampler2D diffuse;
uniform vec3 tint;

void main() {
    vec2 uv = vUv;

    // Flip the image
    uv.y = 1.0 - uv.y;

    vec4 color = texture2D(diffuse, uv);
    // This is called multiplicative blending
    color.xyz *= tint;

    gl_FragColor = color;
}
