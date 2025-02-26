varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vColour;

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
    vec3 normal = normalize(cross(
                dFdx(vPosition.xyz),
                dFdy(vPosition.xyz)
            ));
    vec3 viewDir = normalize(cameraPosition - vPosition);

    vec3 purple = vec3(0.0, 0.3, 0.6);
    vec3 lightBlue = vec3(0.6, 0.3, 0.1);

    // Ambient light
    vec3 ambient = vec3(0.5);

    // Hemisphere light
    float remappedNormal = remap(normal.y, -1.0, 1.0, 0.0, 1.0);
    vec3 hemiLight = mix(purple, lightBlue, remappedNormal);

    // Lambertian lighting
    vec3 lightColor = vec3(0.8);
    vec3 lightDirection = normalize(vec3(1.0, 1.0, 0.0));
    float dp = max(0.0, dot(normal, lightDirection));
    vec3 diffuse = dp * lightColor;

    // Specular lighting (Phong)
    vec3 r = normalize(reflect(-lightDirection, normal));
    float phongValue = max(0.0, dot(viewDir, r));
    phongValue = pow(phongValue, 64.0);

    vec3 specular = vec3(phongValue);

    // IBL Specular (Background Specular)
    vec3 iblCoord = normalize(reflect(-viewDir, normal));
    vec3 iblSample = textureCube(specMap, iblCoord).xyz;

    specular += iblSample * 0.5;

    // Fresnel
    float fresnelValue = 1.0 - dot(viewDir, normal);
    fresnelValue = pow(fresnelValue, 1.4);

    specular *= fresnelValue;

    vec3 baseColor = vColour;
    vec3 lighting = vec3(0.0);
    lighting = ambient * 0.0 + hemiLight * 0.9 + diffuse * 1.0;

    vec3 color = baseColor * lighting + specular;
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(vec3(fresnelValue), 1.0);
}
