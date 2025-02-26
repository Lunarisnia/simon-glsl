varying vec2 vUv;

void main() {
    float maxValue = 255.0;

    // 0x00FF00 = Green (0, 1, 0)
    vec3 green = vec3(0.0, 1.0, 0.0);
    // 0x808080 = Gray
    vec3 gray = vec3(128.0, 128.0, 128.0) / maxValue;
    // 0xC0C0FF = Violet
    vec3 violet = vec3(192.0, 192.0, 255.0) / maxValue;

    // Black to White horizontal gradient
    vec3 bwGradient = vec3(vUv.x);

    // White to Black horizontal gradient
    vec3 wbGradient = 1.0 - bwGradient;

    // Normal UV map
    vec3 uv = vec3(vUv, 0.0);

    // Red top left bottom right blue
    vec3 redTopLeft = vec3(vUv.y, 0.0, vUv.x);

    gl_FragColor = vec4(redTopLeft, 1.0);
}
