attribute vec3 simondevColours;

varying vec2 vUv;
varying vec3 vertexColors;

void main() {
    vec4 localPosition = vec4(position, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * localPosition;
    vUv = uv;
    vertexColors = simondevColours;
}
