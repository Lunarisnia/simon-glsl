varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float map(vec3 rayPosition) {
    float result;

    result = sdSphere(rayPosition - vec3(0.0, 0.0, 5.0), 1.0);

    return result;
}

vec3 CalculateNormal(vec3 p)
{
    const float h = 0.0001; // replace by an appropriate value
    const vec2 k = vec2(1, -1);
    return normalize(k.xyy * map(p + k.xyy * h) +
            k.yyx * map(p + k.yyx * h) +
            k.yxy * map(p + k.yxy * h) +
            k.xxx * map(p + k.xxx * h));
}

float RayCast(vec3 rayOrigin, vec3 rayDir, int numStep, float minDist, float maxDist) {
    vec3 rayPosition = vec3(0.0);
    float dist = 0.0;

    for (int i = 0; i < numStep; i++) {
        rayPosition = rayOrigin + rayDir * dist;

        float currentDist = map(rayPosition);
        dist += currentDist;
        if (currentDist < minDist) {
            break;
        }

        if (dist > maxDist) {
            return -1.0;
        }
    }

    return dist;
}

vec3 RayMarch(vec3 rayOrigin, vec3 rayDir) {
    float result = RayCast(rayOrigin, rayDir, 256, 0.001, 1000.0);

    if (result < 0.0) {
        return vec3(0.0);
    }

    vec3 pos = rayOrigin + rayDir * result;
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
