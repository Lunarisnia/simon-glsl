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

mat3 rotateX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    );
}

// Draws the entire scene
float map(vec3 pos) {
    float sphere = sdfSphere(pos - vec3(0.0, 0.0, 5.0), 1.0);
    float box = sdBox(pos - vec3(2.0, 0.0, 5.0), vec3(1.0));

    vec3 torusPos = pos - vec3(-2.0, 0.0, 5.0);
    torusPos *= rotateX(90.0);
    float torus = sdTorus(torusPos, vec2(0.5, 0.2));

    float dist = min(torus, box);

    return dist;
}

vec3 RayMarch(vec3 cameraOrigin, vec3 cameraDir) {
    int numSteps = 256;
    float maxDist = 1000.0;

    vec3 position = vec3(0.0);
    float dist = 0.0;

    for (int i = 0; i < numSteps; i++) {
        position = cameraOrigin + dist * cameraDir;

        float distToScene = map(position);
        // case 1: distToScene < 0, intersected something
        if (distToScene < 0.001) {
            break;
        }
        dist += distToScene;

        // case 2: dist > maxDist, overshoot and went out of the world
        if (dist > maxDist) {
            return vec3(0.0);
        }

        // case 3: haven't hit anything, loop around
    }

    // guaranteed to have hit something
    return vec3(1.0);
}

void main() {
    vec2 uv = vUv;
    vec2 pc = (uv - 0.5) * u_resolution;

    vec3 rayDir = normalize(vec3(pc * 2.0 / u_resolution.y, 1.0));
    vec3 rayOrigin = vec3(0.0);

    vec3 color = RayMarch(rayOrigin, rayDir);

    gl_FragColor = vec4(color, 1.0);
}
