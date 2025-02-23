attribute vec3 simondevColours;

varying vec2 vUv;
varying vec3 vertexColors;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec4 localPosition = vec4(position, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * localPosition;
    vUv = uv;
    vertexColors = simondevColours;
    vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
}
