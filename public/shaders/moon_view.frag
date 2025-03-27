varying vec2 vUv;

uniform float u_time;
uniform vec2 u_resolution;

mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

// The MIT License
// Copyright © 2013 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org/
//
// https://www.shadertoy.com/view/lsf3WH
// SimonDev: Renamed function to "Math_Random" from "hash"
float Math_Random(vec2 p) // replace this by something better
{
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float noise(vec2 coords) {
    vec2 texSize = vec2(1.0);
    vec2 pc = coords * texSize;
    vec2 base = floor(pc);

    float s1 = Math_Random((base + vec2(0.0, 0.0)) / texSize);
    float s2 = Math_Random((base + vec2(1.0, 0.0)) / texSize);
    float s3 = Math_Random((base + vec2(0.0, 1.0)) / texSize);
    float s4 = Math_Random((base + vec2(1.0, 1.0)) / texSize);

    vec2 f = smoothstep(0.0, 1.0, fract(pc));

    float px1 = mix(s1, s2, f.x);
    float px2 = mix(s3, s4, f.x);
    float result = mix(px1, px2, f.y);
    return result;
}

float noiseFBM(vec2 p, int octaves, float persistence, float lacunarity) {
    float amplitude = 0.5;
    float total = 0.0;

    for (int i = 0; i < octaves; ++i) {
        float noiseValue = noise(p);
        total += noiseValue * amplitude;
        amplitude *= persistence;
        p = p * lacunarity;
    }

    return total;
}

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdPlane(vec3 p) {
    return p.y;
}

vec3 GRAY = vec3(0.6);

struct MaterialInfo {
    float dist;
    vec3 color;
    int type;
};

vec3 ShadePlanet(vec3 pos, vec3 normal) {
    float noiseSample = noiseFBM((pos.xy / 10.0 + 893.0), 8, 0.5, 2.0);
    float desertSample = noiseFBM((pos.xy / 10.0 + 362.0), 8, 0.5, 2.0);
    float cloudSample = noiseFBM((pos.xy / 10.0 + 808.0), 4, 0.5, 2.0);

    // rgb(34, 59, 7)
    vec3 earthGreen = vec3(34.0, 95.0, 30.0) / 255.0;
    vec3 desertCream = vec3(254.0, 216.0, 163.0) / 255.0;
    vec3 landColor = mix(earthGreen, desertCream, smoothstep(0.1, 0.2, desertSample));
    landColor = mix(landColor, vec3(1.0), smoothstep(0.2, 0.6, noiseSample));
    landColor = mix(landColor, vec3(1.0), smoothstep(0.2, 0.9, abs(normal.y)));

    vec3 deepSeaColor = vec3(14.0, 17.0, 120.0) / 255.0;
    vec3 seaColor = mix(deepSeaColor, vec3(1.0), smoothstep(0.07, 0.15, noiseSample));

    vec3 planetColor = mix(seaColor, landColor, smoothstep(0.1, 0.2, noiseSample));
    planetColor = mix(planetColor, vec3(1.0), smoothstep(0.02, 0.9, cloudSample));

    // Fresnel
    float fresnel = smoothstep(1.0, 0.1, -normal.z);
    fresnel = pow(fresnel, 0.8);
    planetColor = mix(planetColor, vec3(0.4), fresnel);

    return planetColor;
}

MaterialInfo map(vec3 pos) {
    MaterialInfo result = MaterialInfo(sdPlane(pos - vec3(0.0, -2.0, 0.0)), GRAY, 0);
    // MaterialInfo result;

    vec3 spherePos = pos - vec3(0.0, 1.0, 100.0);
    float sphere = sdSphere(spherePos, 80.0);
    if (sphere <= result.dist) {
        result.color = vec3(1.0);
        result.type = 1;
    } else {
        result.color = GRAY;
        result.type = 0;
    }
    result.dist = min(result.dist, sphere);

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

vec3 CalculateLighting(vec3 normal, vec3 lightDir, vec3 lightColor) {
    float dp = max(0.0, dot(normal, lightDir));
    vec3 diffuse = lightColor * dp;

    return diffuse;
}

float CalculateShadow(vec3 pos, vec3 lightDir) {
    float res = 1.0;
    float d = 0.01;
    for (int i = 0; i < 64; i++) {
        float distToScene = map(pos + lightDir * d).dist;

        if (distToScene < 0.001) {
            return 0.0;
        }

        res = min(res, 2.0 * distToScene / d);
        d += distToScene;
    }

    return res;
}

vec3 CalculateColor(vec3 color, vec3 position, vec3 normal, int type) {
    if (type > 1) {
        return color;
    }

    // TODO: Process color
    if (type == 1) {
        return ShadePlanet(position, normal);
    }

    return color;
}

vec3 RayMarch(vec3 cameraOrigin, vec3 cameraDir) {
    int numSteps = 256;
    float maxDist = 1000.0;

    vec3 position = vec3(0.0);
    MaterialInfo result;

    for (int i = 0; i < numSteps; i++) {
        position = cameraOrigin + result.dist * cameraDir;

        MaterialInfo dist = map(position);
        result.dist += dist.dist;
        result.color = dist.color;
        result.type = dist.type;

        // case 1: distToScene < 0, intersected something
        if (dist.dist <= 0.001) {
            break;
        }

        // case 2: dist > maxDist, overshoot and went out of the world
        if (result.dist > maxDist) {
            return vec3(0.2);
        }

        // case 3: haven't hit anything, loop around
    }

    vec3 normal = CalculateNormal(position);
    vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
    vec3 lighting = CalculateLighting(normal, lightDir, vec3(1.0));
    float shadow = CalculateShadow(position, lightDir);
    result.color = CalculateColor(result.color, position, normal, result.type);

    // guaranteed to have hit something
    return result.color * lighting * shadow;
}

mat3 CreateCameraMatrix(vec3 cameraOrigin, vec3 cameraLookAt, vec3 cameraUp) {
    vec3 z = normalize(cameraLookAt - cameraOrigin);
    vec3 x = normalize(cross(cameraUp, z));
    vec3 y = normalize(cross(z, x));

    return mat3(x, y, z);
}

void main() {
    vec2 uv = vUv;
    vec2 pc = (uv - 0.5) * u_resolution;

    vec3 rayDir = normalize(vec3(pc * 2.0 / u_resolution.y, 1.0));
    vec3 rayOrigin = vec3(0.0, 1.0, -1.0);
    vec3 rayLookAt = vec3(0.0, 1.0, 0.0);
    vec3 cameraUp = vec3(0.0, 1.0, 0.0);
    mat3 camera = CreateCameraMatrix(rayOrigin, rayLookAt, cameraUp);

    vec3 color = RayMarch(rayOrigin, rayDir * camera);

    gl_FragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.0);
}
