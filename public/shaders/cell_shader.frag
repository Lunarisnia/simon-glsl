varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform samplerCube specMap;

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

void main() {
    vec2 uv = vUv;
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vPosition);

    vec3 monkeColor = vec3(0.3);

    // Diffuse
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 lightColor = vec3(0.9);
    float dp = max(0.0, dot(normal, lightDir));

    // Cell shader
    // dp *= smoothstep(0.5, 0.55, dp);

    vec3 darkestShade = vec3(0.4);
    vec3 lighterShade = vec3(0.8);

    // vec3 lambertian = mix(mix(darkestShade, lighterShade, step(0.6, dp + 0.15)), lightColor, step(0.6, dp)) * step(0.3, dp);
    vec3 lambertian = lightColor * dp;

    // Specular lighting
    vec3 r = normalize(reflect(-lightDir, normal));
    float phongValue = max(0.0, dot(viewDir, r));
    phongValue = pow(phongValue, 64.0);

    // IBL Specular
    vec3 iblCoord = normalize(reflect(-viewDir, normal));
    vec3 iblSample = textureCube(specMap, iblCoord).xyz;

    // Fresnel
    float fresnelValue = 1.0 - dot(viewDir, normal);
    fresnelValue = pow(fresnelValue, 2.7);
    fresnelValue = smoothstep(0.5, 0.55, fresnelValue);

    // Hemisphere
    vec3 skyColor = vec3(1.0);
    vec3 groundColor = vec3(0.3);
    vec3 hemiLight = mix(groundColor, skyColor, remap(normal.y, -1.0, 1.0, 0.0, 1.0)) * 0.4;

    vec3 specular = vec3(phongValue) + iblSample * fresnelValue;

    vec3 lighting = vec3(0.0) + (hemiLight) + lambertian;

    vec3 color = monkeColor * lighting + specular;
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
}
