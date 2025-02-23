varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform samplerCube specMap;

void main() {
    vec2 uv = vUv;
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vPosition);

    // Ambient Light
    vec3 ambient = vec3(0.4);

    // Diffuse Lighting
    vec3 lightDir = vec3(-1.0, 1.0, 0.0);
    vec3 lightColor = vec3(0.9);
    float dp = max(0.0, dot(lightDir, normal));
    vec3 diffuse = lightColor * dp;

    vec3 lighting = ambient + diffuse;

    // Phong
    vec3 r = normalize(reflect(-lightDir, normal));
    float phong = max(0.0, dot(viewDir, r));
    phong = pow(phong, 128.0);

    // Blin-Phong
    vec3 halfDir = normalize(lightDir + viewDir);
    float specAngle = max(0.0, dot(halfDir, normal));
    specAngle = pow(specAngle, 64.0);

    vec3 specular = vec3(0.0) + specAngle;

    vec3 baseColor = vec3(0.3);

    vec3 color = baseColor * lighting + specular;
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
}
