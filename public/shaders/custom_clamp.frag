varying vec2 vUv;

float customClamp(float xMin, float xMax, float value) {
    float withinMaxRange = min(value, xMax);
    float withinMinRange = max(xMin, withinMaxRange);
    return withinMinRange;
}

void main() {
    vec2 uv = vUv;

    float t = uv.x * 2.0;
    t = customClamp(0.0, 1.0, t);

    float linear = smoothstep(0.0, 0.005, abs(uv.y - mix(0.0, 1.0, t)));

    vec3 red = vec3(1.0, 0.0, 0.0);

    vec3 color = vec3(t);
    color = mix(red, color, linear);

    gl_FragColor = vec4(color, 1.0);
}
