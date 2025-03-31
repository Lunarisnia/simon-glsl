varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

// ================== UTILITY FUNCTION =======

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}

mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

// ==========================================

struct Material {
    float dist;
    vec3 color;
};

Material materialMin(Material a, Material b) {
    if (a.dist < b.dist) {
        return a;
    }
    return b;
}

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdBox(vec3 p, vec3 b)
{
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

Material map(vec3 rayPosition) {
    Material result;
    result.dist = sdSphere(rayPosition - vec3(-3.0, 0.0, 5.0), 1.0);
    result.color = vec3(0.0, 1.0, 0.0);

    vec3 blockPosition = rayPosition - vec3(3.0, 0.0, 5.0);
    Material block = Material(sdBox(blockPosition, vec3(1.0, 2.0, 1.0)), vec3(1.0));
    result = materialMin(result, block);

    vec3 wallRightPosition = rayPosition - vec3(6.0, 0.0, 5.0);
    Material blockWallRight = Material(sdBox(wallRightPosition, vec3(1.0, 5.0, 4.0)), vec3(1.0));
    result = materialMin(result, blockWallRight);

    vec3 wallLeftPosition = rayPosition - vec3(-6.0, 0.0, 5.0);
    Material blockWallLeft = Material(sdBox(wallLeftPosition, vec3(1.0, 5.0, 4.0)), vec3(1.0));
    result = materialMin(result, blockWallLeft);

    return result;
}

vec3 CalculateNormal(vec3 p)
{
    const float h = 0.0001; // replace by an appropriate value
    const vec2 k = vec2(1, -1);
    return normalize(k.xyy * map(p + k.xyy * h).dist +
            k.yyx * map(p + k.yyx * h).dist +
            k.yxy * map(p + k.yxy * h).dist +
            k.xxx * map(p + k.xxx * h).dist);
}

float CalculateAO(vec3 pos, vec3 normal) {
    float ao = 0.0;
    float stepSize = 0.1;

    for (float i = 0.0; i < 5.0; ++i) {
        float distFactor = 1.0 / pow(2.0, i);

        ao += distFactor * (i * stepSize - map(pos + normal * i * stepSize).dist);
    }

    return 1.0 - ao;
}

vec3 CalculateLighting(vec3 pos, vec3 normal, vec3 lightColour, vec3 lightDir) {
    float dp = saturate(dot(normal, lightDir));

    return lightColour * dp;
}

Material RayCast(vec3 rayOrigin, vec3 rayDir, int numStep, float minDist, float maxDist) {
    vec3 rayPosition = vec3(0.0);
    Material result;
    Material defaultResult = Material(-1.0, vec3(0.0));

    for (int i = 0; i < numStep; i++) {
        rayPosition = rayOrigin + rayDir * result.dist;

        Material currentResult = map(rayPosition);
        result.dist += currentResult.dist;
        result.color = currentResult.color;
        if (currentResult.dist < minDist) {
            break;
        }

        if (result.dist > maxDist) {
            return defaultResult;
        }
    }

    return result;
}

float CalculateShadow(vec3 pos, vec3 lightDir) {
    Material result = RayCast(pos, lightDir, 64, 0.01, 10.0);

    if (result.dist >= 0.0) {
        return 0.0;
    }

    return 1.0;
}

float softshadow(in vec3 ro, in vec3 rd, in float mint, in float maxt, in float k)
{
    float res = 1.0;
    float t = mint;
    for (int i = 0; i < 32; i++)
    {
        float h = map(ro + rd * t).color.x;
        res = min(res, k * h / t);
        t += clamp(h, 0.1, 1.0);
        if (res < 0.001 || t > maxt) break;
    }
    return clamp(res, 0.0, 1.0);
}

vec3 CalculateOrbLighting(vec3 pos, vec3 normal, vec3 lightColour, vec3 lightDir) {
    vec3 specular = vec3(0.0);
    vec3 lightPosition = vec3(0.0, 0.0, 5.0);

    vec3 light = lightPosition - pos;

    float llig = dot(light, light);
    float im = inversesqrt(llig);
    light = light * im;

    float diffuse = saturate(dot(normal, light));

    // float at = 2.0 * exp2(-2.00 * llig);
    // diffuse *= at;

    float shadow = 0.0;
    if (diffuse > 0.01) {
        shadow = softshadow(pos, light, 0.3, sqrt(llig), 32.0);
        diffuse *= shadow;
    }

    specular += lightColour * diffuse;
    return specular;
}

vec3 RayMarch(vec3 rayOrigin, vec3 rayDir) {
    Material result = RayCast(rayOrigin, rayDir, 256, 0.001, 1000.0);

    if (result.dist < 0.0) {
        return vec3(0.0);
    }

    vec3 pos = rayOrigin + rayDir * result.dist;
    vec3 normal = CalculateNormal(pos);
    vec3 lighting = CalculateLighting(pos, normal, vec3(1.0), vec3(1.0, 2.0, -2.0));
    vec3 orbLighting = CalculateOrbLighting(pos, normal, vec3(1.0), vec3(0.0)); // Should be specular
    float shadow = CalculateShadow(pos, orbLighting);

    return result.color * 0.0 * lighting + (vec3(1.0) * 0.1) + 2.0 * orbLighting;
}

void main() {
    vec2 uv = vUv;
    vec2 pc = (uv - 0.5) * u_resolution;

    vec3 rayOrigin = vec3(0.0);
    vec3 rayDir = normalize(vec3(pc * 2.0 / u_resolution.y, 1.0));

    vec3 color = RayMarch(rayOrigin, rayDir);

    gl_FragColor = vec4(color, 1.0);
}
