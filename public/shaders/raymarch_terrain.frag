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

struct MaterialInfo {
    float dist;
    vec3 color;
    float specular;
};

vec3 RED = vec3(1.0, 0.0, 0.0);
vec3 GREEN = vec3(0.0, 1.0, 0.0);
vec3 BLUE = vec3(0.0, 0.0, 1.0);
vec3 GRAY = vec3(0.5);
vec3 WHITE = vec3(1.0);

// Draws the entire scene
MaterialInfo map(vec3 pos) {
    float noiseSample = noiseFBM(pos.xz / 2.0, 1, 0.5, 2.0);
    noiseSample = abs(noiseSample);
    noiseSample *= 1.5;
    noiseSample += 0.1 * noiseFBM(pos.xz * 4.0, 6, 0.5, 2.0);

    MaterialInfo result = MaterialInfo(pos.y + noiseSample, GRAY, 1.0);

    // float dist = sdfSphere(pos - vec3(-2.0, -0.85, 5.0), 1.0);
    // if (dist < result.dist) {
    //     result.color = BLUE;
    //     result.specular = 1.0;
    // } else {
    //     result.color = result.color;
    //     result.specular = 1.0;
    // }
    // result.dist = min(result.dist, dist);
    //
    // float sphere = sdfSphere(pos - vec3(0.0, -0.85, 48.0 + sin(u_time) * 25.0), 1.0);
    // dist = min(dist, sphere);
    // if (dist < result.dist) {
    //     result.color = vec3(0.0);
    //     result.specular = 1.0;
    // } else {
    //     result.color = result.color;
    //     result.specular = 1.0;
    // }
    // result.dist = min(result.dist, dist);
    //
    // float box = sdBox(pos - vec3(2.0, -0.85, 5.0), vec3(1.0));
    // dist = min(dist, box);
    // if (dist < result.dist) {
    //     result.color = GREEN;
    //     result.specular = 8.0;
    // } else {
    //     result.color = result.color;
    //     result.specular = 1.0;
    // }
    // result.dist = min(dist, result.dist);

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
    // dp *= smoothstep(0.5, 0.55, dp);
    vec3 diffuse = lightColor * dp;

    vec3 lighting = diffuse;

    return lighting;
}

vec3 CalculateSpecular(vec3 viewDir, vec3 normal, vec3 lightDir, float k) {
    vec3 specular = vec3(0.0);
    // Phong
    vec3 r = normalize(reflect(-lightDir, normal));
    float phong = max(0.0, dot(viewDir, r));
    phong = pow(phong, 2.0 * k);

    specular = vec3(phong);

    return specular;
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

vec3 RayMarch(vec3 cameraOrigin, vec3 cameraDir) {
    int numSteps = 256;
    float maxDist = 1000.0;

    vec3 position = vec3(0.0);
    MaterialInfo materialInfo;
    vec3 skyColor = vec3(0.7, 0.8, 0.8);

    for (int i = 0; i < numSteps; i++) {
        position = cameraOrigin + materialInfo.dist * cameraDir;

        MaterialInfo currentMaterialInfo = map(position);
        // case 1: distToScene < 0, intersected something
        if (currentMaterialInfo.dist < 0.001) {
            break;
        }
        materialInfo.dist += currentMaterialInfo.dist;
        materialInfo.color = currentMaterialInfo.color;
        materialInfo.specular = currentMaterialInfo.specular;

        // case 2: dist > maxDist, overshoot and went out of the world
        if (materialInfo.dist > maxDist) {
            return skyColor;
        }

        // case 3: haven't hit anything, loop around
    }

    vec3 normal = CalculateNormal(position);
    vec3 lightDir = normalize(vec3(1.0, 2.0, -1.0));
    vec3 lighting = CalculateLighting(position, normal, lightDir, vec3(1.0));
    vec3 specular = CalculateSpecular(-cameraDir, normal, lightDir, materialInfo.specular);
    float shadow = CalculateShadow(position, lightDir);
    lighting = materialInfo.color * lighting;
    lighting *= shadow;

    vec3 color = lighting;

    float fogFactor = 1.0 - exp(-position.z * 0.01);
    color = mix(color, skyColor, fogFactor);

    // guaranteed to have hit something
    return color;
}

void main() {
    vec2 uv = vUv;
    vec2 pc = (uv - 0.5) * u_resolution;

    vec3 rayDir = normalize(vec3(pc * 2.0 / u_resolution.y, 1.0));
    vec3 rayOrigin = vec3(0.0);

    vec3 color = RayMarch(rayOrigin, rayDir);

    gl_FragColor = vec4(color, 1.0);
}
