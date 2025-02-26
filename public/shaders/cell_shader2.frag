varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vec2 uv = vUv;
    vec3 normal = normalize(vNormal);

    vec3 monkeColor = vec3(0.8);

    // Diffuse
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 lightColor = vec3(1.0, 0.0, 0.0);
    float dp = max(0.0, dot(lightDir, normal));
    dp = step(0.5, dp);
    vec3 lambertian = lightColor * dp;

    // Hemisphere
    vec3 skyColor = vec3(1.0);
    vec3 groundColor = vec3(0.3);
    vec3 hemiLight = mix(groundColor, skyColor, normal.y) * 0.4;

    vec3 lighting = vec3(0.4) + hemiLight + lambertian;

    vec3 color = monkeColor * lighting;

    gl_FragColor = vec4(color, 1.0);
}
