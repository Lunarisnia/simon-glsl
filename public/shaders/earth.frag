varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

float sdCircle(vec2 pc, float radius) {
    return length(pc) - radius;
}

void main() {
    vec2 uv = vUv;
    vec2 pc = (uv - 0.5) * u_resolution;

    float st = uv.y;
    vec3 color = mix(vec3(0.0), vec3(0.0, 0.0, 255.0), smoothstep(0.0, 20.0, st));

    float sphereRadius = 400.0;
    float d = sdCircle(pc, sphereRadius);
    vec3 sphereColor = vec3(0.0);
    if (d <= 0.0) {
        float x = pc.x / sphereRadius;
        float y = pc.y / sphereRadius;
        float z = sqrt(1.0 - x * x - y * y);
        vec3 normal = vec3(x, y, z);

        // Lighting
        vec3 lightColor = vec3(1.0);
        vec3 lightDir = vec3(sin(u_time), 1.0, 1.0);

        float dp = max(0.0, dot(lightDir, normal));

        vec3 diffuse = lightColor * dp;

        vec3 lighting = diffuse * 0.25;

        // Specular
        vec3 r = normalize(reflect(-lightDir, normalize(normal)));
        float phongValue = max(0.0, dot(vec3(0.0, 0.0, 1.0), r));
        phongValue = pow(phongValue, 12.0);

        vec3 specular = vec3(phongValue) * 0.5 * diffuse;
        sphereColor = lighting + specular;

        float fresnel = smoothstep(1.0, 0.1, normal.z);
        fresnel = pow(fresnel, 2.0) * dp;
        sphereColor = mix(sphereColor, vec3(0.0, 0.5, 1.0), fresnel);
    }

    color = mix(sphereColor, color, smoothstep(0.0, 1.0, d));

    gl_FragColor = vec4(color, 1.0);
}
