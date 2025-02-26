varying vec2 vUv;
varying vec3 vertexColors;

uniform vec3 colour1;
uniform vec3 colour2;

void main() {
    vec2 uv = vUv;

    // I think the main reason why the colour in the middle is darker
    // is because along the uv it interpolate in a shape of a bowl.
    // where the red value are slowly decreasing being replace by the
    // increasing green value, the middle are where the two value is at 0.5
    // which is half the colour. That's why its darker
    vec3 redGreenMix = mix(
            vec3(1.0, 0.0, 0.0),
            vec3(0.0, 1.0, 0.0),
            uv.x
        );

    vec3 universalColorMix = mix(
            colour1,
            colour2,
            uv.x
        );

    gl_FragColor = vec4(vertexColors, 1.0);
}
