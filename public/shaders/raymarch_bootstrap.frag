varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

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

struct Material {
    float dist;
    vec3 color;
};

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

Material map(vec3 rayPosition) {
    Material result;

    result.dist = sdSphere(rayPosition - vec3(0.0, 0.0, 5.0), 1.0);
    result.color = vec3(0.0, 1.0, 0.0);

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

vec3 RayMarch(vec3 rayOrigin, vec3 rayDir) {
    Material result = RayCast(rayOrigin, rayDir, 256, 0.001, 1000.0);

    if (result.dist < 0.0) {
        return vec3(0.0);
    }

    vec3 pos = rayOrigin + rayDir * result.dist;
    vec3 normal = CalculateNormal(pos);

    return normal;
}

void main() {
    vec2 uv = vUv;
    vec2 pc = (uv - 0.5) * u_resolution;

    vec3 rayOrigin = vec3(0.0);
    vec3 rayDir = normalize(vec3(pc * 2.0 / u_resolution.y, 1.0));

    vec3 color = RayMarch(rayOrigin, rayDir);

    gl_FragColor = vec4(color, 1.0);
}
