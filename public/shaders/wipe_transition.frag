varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D diffuse;
uniform sampler2D tex;

void main() {
    vec2 uv = vUv;

    vec4 imageA = texture2D(tex, uv);
    vec4 imageB = texture2D(diffuse, uv);

    float st = uv.x;
    vec3 color = vec3(st);
    color = mix(imageA.xyz, imageB.xyz, step(2.0 - u_time * 0.25, st));

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = texture2D(tex, uv);
}
