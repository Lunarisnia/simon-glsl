varying vec2 vUv;

uniform float u_time;
uniform sampler2D diffuse;

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

void main() {
    vec2 uv = vUv;

    // If I remap things to a range of [0, 1] I can use it as blending
    float crtFilter = remap(sin(uv.y * 400.0 + u_time * 10.0), -1.0, 1.0, 0.8, 1.0);
    float crtFilter2 = remap(sin(uv.y * 50.0 - u_time * 2.0), -1.0, 1.0, 0.8, 1.0);

    vec3 tex = texture2D(diffuse, uv).xyz * crtFilter * crtFilter2;

    // gl_FragColor = vec4(st, 1.0);
    gl_FragColor = vec4(tex, 1.0);
    // gl_FragColor = tex;
}
