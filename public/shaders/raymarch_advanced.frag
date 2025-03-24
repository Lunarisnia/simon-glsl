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

float sdfSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdBox(vec3 p, vec3 b)
{
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
float sdTorus(vec3 p, vec2 t)
{
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

float sdPlane(vec3 p) {
    return p.y;
}

mat3 rotateX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    );
}

struct MaterialInfo {
    float dist;
    vec3 color;
};

vec3 RED = vec3(1.0, 0.0, 0.0);
vec3 BLUE = vec3(0.0, 1.0, 0.0);
vec3 GREEN = vec3(0.0, 0.0, 1.0);
vec3 GRAY = vec3(0.5);
vec3 WHITE = vec3(1.0);

// Draws the entire scene
MaterialInfo map(vec3 pos) {
    float plane = sdPlane(pos - vec3(0.0, -2.0, 0.0));

    MaterialInfo result = MaterialInfo(plane, RED);

    float dist = sdfSphere(pos - vec3(-2.0, -0.85, 5.0), 1.0);
    if (dist < result.dist) {
        result.color = BLUE;
    } else {
        result.color = result.color;
    }
    result.dist = min(result.dist, dist);

    float box = sdBox(pos - vec3(2.0, -0.85, 5.0), vec3(1.0));
    dist = min(dist, box);
    if (dist < result.dist) {
        result.color = GREEN;
    } else {
        result.color = result.color;
    }
    result.dist = min(dist, result.dist);

    return result;
}

vec3 CalculateNormal(vec3 pos) {
    const float EPS = 0.0001;
    vec3 n = vec3(
            map(pos + vec3(EPS, 0.0, 0.0)).dist - map(pos - vec3(EPS, 0.0, 0.0)).dist,
            map(pos + vec3(0.0, EPS, 0.0)).dist - map(pos - vec3(0.0, EPS, 0.0)).dist,
            map(pos + vec3(0.0, 0.0, EPS)).dist - map(pos - vec3(0.0, 0.0, EPS)).dist
        );
    return normalize(n);
}

vec3 CalculateLighting(vec3 pos, vec3 normal, vec3 lightDir, vec3 lightColor) {
    float dp = saturate(dot(normal, lightDir));

    return lightColor * dp;
}

vec3 RayMarch(vec3 cameraOrigin, vec3 cameraDir) {
    int numSteps = 256;
    float maxDist = 1000.0;

    vec3 position = vec3(0.0);
    MaterialInfo materialInfo;

    for (int i = 0; i < numSteps; i++) {
        position = cameraOrigin + materialInfo.dist * cameraDir;

        MaterialInfo currentMaterialInfo = map(position);
        // case 1: distToScene < 0, intersected something
        if (currentMaterialInfo.dist < 0.001) {
            break;
        }
        materialInfo.dist += currentMaterialInfo.dist;
        materialInfo.color = currentMaterialInfo.color;

        // case 2: dist > maxDist, overshoot and went out of the world
        if (materialInfo.dist > maxDist) {
            return vec3(0.0);
        }

        // case 3: haven't hit anything, loop around
    }

    vec3 normal = CalculateNormal(position);
    vec3 lightDir = vec3(1.0, 2.0, -1.0);
    vec3 lighting = CalculateLighting(position, normal, lightDir, vec3(1.0));

    // guaranteed to have hit something
    return materialInfo.color * lighting;
}

void main() {
    vec2 uv = vUv;
    vec2 pc = (uv - 0.5) * u_resolution;

    vec3 rayDir = normalize(vec3(pc * 2.0 / u_resolution.y, 1.0));
    vec3 rayOrigin = vec3(0.0);

    vec3 color = RayMarch(rayOrigin, rayDir);

    gl_FragColor = vec4(color, 1.0);
}
