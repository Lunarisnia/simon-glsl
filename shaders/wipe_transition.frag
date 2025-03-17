varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D diffuse;
uniform sampler2D tex;

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    vec4 imageA = texture2D(tex, uv);
    vec4 imageB = texture2D(diffuse, uv);

    float animation = u_time * 200.0;
    float st = (pixelCoords.x - (sin(u_time + pixelCoords.y / 129.0) * 256.0) - 2000.0) + animation;
    vec3 color = vec3(st);
    // color = mix(imageA.xyz, imageB.xyz, smoothstep(1.0 - u_time * 0.25, 8.0, st));
    color = mix(imageA.xyz, imageB.xyz, smoothstep(0.0, 1000.0, st));

    gl_FragColor = vec4(color, 1.0);
}
