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

// Source: https://www.shadertoy.com/view/4dffRH
vec3 hash(vec3 p) // this hash is not production ready, please
{ // replace this by something better
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
            dot(p, vec3(269.5, 183.3, 246.1)),
            dot(p, vec3(113.5, 271.9, 124.6)));

    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// Copyright (C) 2011 by Ashima Arts (Simplex noise)
// Copyright (C) 2011-2016 by Stefan Gustavson (Classic noise and others)
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// https://github.com/ashima/webgl-noise/tree/master/src
vec3 mod289(vec3 x)
{
    return x - floor(x / 289.0) * 289.0;
}

vec4 mod289(vec4 x)
{
    return x - floor(x / 289.0) * 289.0;
}

vec4 permute(vec4 x)
{
    return mod289((x * 34.0 + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - r * 0.85373472095314;
}

vec4 snoise(vec3 v)
{
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);

    // First corner
    vec3 i = floor(v + dot(v, vec3(C.y)));
    vec3 x0 = v - i + dot(i, vec3(C.x));

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.x;
    vec3 x2 = x0 - i2 + C.y;
    vec3 x3 = x0 - 0.5;

    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec4 p =
        permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    vec4 j = p - 49.0 * floor(p / 49.0); // mod(p,7*7)

    vec4 x_ = floor(j / 7.0);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = (x_ * 2.0 + 0.5) / 7.0 - 1.0;
    vec4 y = (y_ * 2.0 + 0.5) / 7.0 - 1.0;

    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 g0 = vec3(a0.xy, h.x);
    vec3 g1 = vec3(a0.zw, h.y);
    vec3 g2 = vec3(a1.xy, h.z);
    vec3 g3 = vec3(a1.zw, h.w);

    // Normalize gradients
    vec4 norm = taylorInvSqrt(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)));
    g0 *= norm.x;
    g1 *= norm.y;
    g2 *= norm.z;
    g3 *= norm.w;

    // Compute noise and gradient at P
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    vec4 m2 = m * m;
    vec4 m3 = m2 * m;
    vec4 m4 = m2 * m2;
    vec3 grad =
        -6.0 * m3.x * x0 * dot(x0, g0) + m4.x * g0 +
            -6.0 * m3.y * x1 * dot(x1, g1) + m4.y * g1 +
            -6.0 * m3.z * x2 * dot(x2, g2) + m4.z * g2 +
            -6.0 * m3.w * x3 * dot(x3, g3) + m4.w * g3;
    vec4 px = vec4(dot(x0, g0), dot(x1, g1), dot(x2, g2), dot(x3, g3));
    return 42.0 * vec4(grad, dot(m4, px));
}

float noise(in vec3 x)
{
    // grid
    vec3 p = floor(x);
    vec3 w = fract(x);

    // quintic interpolant
    vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);

    // gradients
    vec3 ga = hash(p + vec3(0.0, 0.0, 0.0));
    vec3 gb = hash(p + vec3(1.0, 0.0, 0.0));
    vec3 gc = hash(p + vec3(0.0, 1.0, 0.0));
    vec3 gd = hash(p + vec3(1.0, 1.0, 0.0));
    vec3 ge = hash(p + vec3(0.0, 0.0, 1.0));
    vec3 gf = hash(p + vec3(1.0, 0.0, 1.0));
    vec3 gg = hash(p + vec3(0.0, 1.0, 1.0));
    vec3 gh = hash(p + vec3(1.0, 1.0, 1.0));

    // projections
    float va = dot(ga, w - vec3(0.0, 0.0, 0.0));
    float vb = dot(gb, w - vec3(1.0, 0.0, 0.0));
    float vc = dot(gc, w - vec3(0.0, 1.0, 0.0));
    float vd = dot(gd, w - vec3(1.0, 1.0, 0.0));
    float ve = dot(ge, w - vec3(0.0, 0.0, 1.0));
    float vf = dot(gf, w - vec3(1.0, 0.0, 1.0));
    float vg = dot(gg, w - vec3(0.0, 1.0, 1.0));
    float vh = dot(gh, w - vec3(1.0, 1.0, 1.0));

    // interpolation
    return va +
        u.x * (vb - va) +
        u.y * (vc - va) +
        u.z * (ve - va) +
        u.x * u.y * (va - vb - vc + vd) +
        u.y * u.z * (va - vc - ve + vg) +
        u.z * u.x * (va - vb - ve + vf) +
        u.x * u.y * u.z * (-va + vb + vc - vd + ve - vf - vg + vh);
}

float fbm(vec3 p, int octaves, float persistence, float lacunarity, float exponentiation) {
    float amplitude = 0.5;
    float frequency = 1.0;
    float total = 0.0;
    float normalization = 0.0;

    for (int i = 0; i < octaves; ++i) {
        float noiseValue = snoise(p * frequency).w;
        total += noiseValue * amplitude;
        normalization += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
    }

    total /= normalization;
    total = total * 0.5 + 0.5;
    total = pow(total, exponentiation);

    return total;
}

float sdCircle(vec2 p, float radius) {
    return length(p) - radius;
}

float map(vec3 pos) {
    return fbm(pos, 8, 0.5, 2.0, 3.0);
}

vec3 calcSDFNormal(vec3 pos, vec3 n) {
    vec2 e = vec2(0.0001, 0.0);
    return normalize(
        n + -600.0 * vec3(
                    map(pos + e.xyy) - map(pos - e.xyy),
                    map(pos + e.yxy) - map(pos - e.yxy),
                    map(pos + e.yyx) - map(pos - e.yyx)
                )
    );
}

float sdUnion(float a, float b) {
    return min(a, b);
}

float softMax(float a, float b, float k) {
    return log(exp(k * a) + exp(k * b)) / k;
}

float softMin(float a, float b, float k) {
    return -softMax(-a, -b, k);
}

float softMinValue(float a, float b, float k) {
    return exp(-b * k) / (exp(-a * k) + exp(-b * k));
}

mat3 rotateY(float radian) {
    float s = sin(radian);
    float c = cos(radian);
    return mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

vec3 DrawPlanet(vec2 pixelCoords, vec3 color) {
    mat3 planetRotation = rotateY(u_time * 0.25);
    float planetRadius = 450.0;
    float d = sdCircle(pixelCoords, planetRadius);
    vec3 planetColor = vec3(0.4);
    if (d <= 0.0) {
        float x = pixelCoords.x / planetRadius;
        float y = pixelCoords.y / planetRadius;
        float z = sqrt(1.0 - x * x - y * y);
        vec3 viewNormal = vec3(x, y, z);
        vec3 wsPosition = planetRotation * vec3(x, y, z);
        vec3 wsNormal = planetRotation * normalize(wsPosition);

        vec3 noiseCoords = wsPosition * 2.0;
        float noiseSample = map(noiseCoords);
        float noiseSample2 = fbm(noiseCoords - vec3(500.0), 8, 0.5, 2.0, 4.0);

        vec3 landColor = vec3(0.8, 0.6, 0.6);
        landColor = mix(vec3(0.3, 0.2, 0.4), landColor, smoothstep(0.01, 0.09, noiseSample2));
        landColor = mix(landColor, vec3(0.6, 0.3, 0.018), smoothstep(0.08, 0.2, noiseSample));
        landColor = mix(landColor, vec3(0.8, 0.6, 0.3), smoothstep(0.09, 0.4, noiseSample));
        landColor = mix(landColor, vec3(0.3), smoothstep(0.6, 0.9, abs(viewNormal.y)));

        vec3 seaColor = vec3(0.1, 0.3, 0.6);
        seaColor = mix(seaColor, vec3(1.0), smoothstep(0.01, 0.12, noiseSample));

        planetColor = mix(seaColor, landColor, smoothstep(0.06, 0.09, noiseSample));

        // Lighting
        vec3 ambientLight = vec3(0.0);
        vec3 lightDirection = vec3(1.0, 1.0, 1.0);
        vec3 lightColor = vec3(1.0);
        vec3 wsSurfaceNormal = calcSDFNormal(noiseCoords, viewNormal);
        float dp = max(0.0, dot(lightDirection, wsSurfaceNormal));
        vec3 diffuse = lightColor * dp;

        vec3 lighting = planetColor * (diffuse + ambientLight);

        planetColor = lighting;

        // Fresnel
        float fresnel = smoothstep(1.0, 0.1, viewNormal.z);
        fresnel = pow(fresnel, 2.0) * dp;
        planetColor = mix(planetColor, vec3(0.3, 0.6, 0.2), fresnel);
    }

    color = mix(color, planetColor, smoothstep(0.0, -1.0, d));
    if (d >= -1.0 && d < 100.0) {
        float x = pixelCoords.x / (planetRadius + 1000.0);
        float y = pixelCoords.y / (planetRadius + 1000.0);
        float z = sqrt(1.0 - x * x - y * y);
        vec3 wsPosition = vec3(x, y, z);
        vec3 wsNormal = normalize(wsPosition);

        float lighting = dot(wsNormal, normalize(vec3(0.5, 1.0, 0.5)));
        lighting = smoothstep(-0.15, 1.0, lighting);

        vec3 glowColor = vec3(0.05, 0.6, 0.3) * exp(-0.01 * d * d) * lighting * 0.75;
        color += glowColor;
    }
    return color;
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    vec3 color = vec3(0.0);
    color = DrawPlanet(pixelCoords, color);

    gl_FragColor = vec4(color, 1.0);
}
