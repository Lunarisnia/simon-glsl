varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec2 lineThickness = vec2(0.0, 0.005);

    float value = uv.x;
    float smoothedValue = smoothstep(0.0, 1.0, value);
    float hardValue = smoothstep(0.66, 1.0, value);

    float line1 = smoothstep(lineThickness.x, lineThickness.y, abs(uv.y - 0.33));
    float line2 = smoothstep(lineThickness.x, lineThickness.y, abs(uv.y - 0.66));
    float linearLine = smoothstep(lineThickness.x, lineThickness.y, abs(uv.y - mix(0.33, 0.66, uv.x)));
    float smoothLine = smoothstep(lineThickness.x, lineThickness.y, abs(uv.y - mix(0.0, 0.33, smoothedValue)));
    float hardLine1 = smoothstep(lineThickness.x, lineThickness.y, abs(uv.y - 0.663));
    float hardLine2 = smoothstep(lineThickness.x, lineThickness.y, abs(uv.y - 1.0));
    float hardLine3 = smoothstep(lineThickness.x, lineThickness.y, abs(uv.x - 0.5));
    float mixedHardLine = mix(hardLine1, hardLine2, step(0.5, uv.x));

    vec3 red = vec3(1.0, 0.0, 0.0);
    vec3 blue = vec3(0.0, 0.0, 1.0);
    vec3 white = vec3(1.0);
    vec3 green = vec3(0.0, 1.0, 0.0);

    vec3 color = vec3(0.0);
    if (uv.y > 0.66) {
        color = mix(red, blue, step(0.5, uv.x));
    } else if (uv.y > 0.33 && uv.y < 0.66) {
        color = mix(red, blue, uv.x);
    } else {
        color = mix(red, blue, smoothstep(0.0, 1.0, uv.x));
    }

    color = mix(white, color, line1);
    color = mix(white, color, line2);
    color = mix(green, color, linearLine);
    color = mix(green, color, smoothLine);
    color = mix(green, color, mixedHardLine);

    gl_FragColor = vec4(color, 1.0);
}
