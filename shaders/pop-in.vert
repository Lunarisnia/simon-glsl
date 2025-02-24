uniform float u_time;

varying vec2 vUv;
varying vec3 vertexColors;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vColour;

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

float easeOutElastic(float x) {
    const float c4 = (2.0 * 3.1415) / 3.0;

    if (x == 0.0) {
        return 0.0;
    } else if (x == 1.0) {
        return 1.0;
    } else {
        return pow(2.0, -10.0 * x) * sin((x * 10.0 - 0.75) * c4) + 1.0;
    }
}

void main() {
    vec3 localPosition = position;

    // localPosition *= easeOutElastic(clamp(u_time - 1.0, 0.0, 1.0));
    float t = remap(sin(localPosition.y * 20.0 + (u_time * 4.0)), -1.0, 1.0, 0.6, 0.9);
    localPosition += normal * t;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(localPosition, 1.0);
    vColour = mix(vec3(0.3, 0.1, 0.6), vec3(0.6, 0.2, 0.8), smoothstep(0.5, 0.8, t));
    vUv = uv;
    vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
}
