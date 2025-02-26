uniform float u_time;

varying vec2 vUv;
varying vec3 vertexColors;
varying vec3 vNormal;
varying vec3 vPosition;

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

mat3 rotateY(float radian) {
    float s = sin(radian);
    float c = cos(radian);
    return mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

mat3 rotateX(float radian) {
    float s = sin(radian);
    float c = cos(radian);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    );
}

mat3 rotateZ(float radian) {
    float s = sin(radian);
    float c = cos(radian);
    return mat3(
        c, -s, 0.0,
        s, c, 0.0,
        0.0, 0.0, 1.0
    );
}

void main() {
    vec3 localPosition = position;

    localPosition *= rotateX(u_time);
    localPosition *= rotateY(u_time);
    // localPosition *= rotateZ(u_time);
    // localPosition.x += sin(u_time);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(localPosition, 1.0);
    vUv = uv;
    vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
}
