varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D tex;

float hash(vec2 p) // replace this by something better
{
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    // vec3 color = vec3(hash(vec2(pixelCoords.x / pixelCoords.y, u_time)));

    // gl_FragColor = vec4(color, 1.0);
    gl_FragColor = texture2D(tex, vUv);
}
