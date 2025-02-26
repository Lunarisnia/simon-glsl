varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdUnion(float a, float b) {
    return min(a, b);
}

float sdIntersect(float a, float b) {
    return max(a, b);
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

mat2 rotate(float radian) {
    float c = cos(radian);
    float s = sin(radian);
    return mat2(
        c, -s,
        s, c
    );
}

vec3 cloud(vec2 pixelCoords, vec3 color, vec3 cloudRadiuses) {
    float d1 = sdCircle(pixelCoords, cloudRadiuses.x);
    float d2 = sdCircle(pixelCoords - vec2(cloudRadiuses.x, 0.0), cloudRadiuses.y);
    float d3 = sdCircle(pixelCoords - vec2(-cloudRadiuses.x, 0.0), cloudRadiuses.z);
    float u = sdUnion(d1, d2);
    u = sdUnion(u, d3);

    vec2 shadowOffset = vec2(-25.0, -25.0);
    float d4 = sdCircle(pixelCoords - shadowOffset, cloudRadiuses.x);
    float d5 = sdCircle(pixelCoords - vec2(cloudRadiuses.x, 0.0) - shadowOffset, cloudRadiuses.y);
    float d6 = sdCircle(pixelCoords - vec2(-cloudRadiuses.x, 0.0) - shadowOffset, cloudRadiuses.z);
    float shadowU = sdUnion(d4, d5);

    shadowU = sdUnion(shadowU, d6);
    color = mix(vec3(0.0), color, smoothstep(-40.0, 10.0, shadowU));

    color = mix(vec3(1.0), color, smoothstep(-1.0, 1.00, u));

    return color;
}

vec2 cloudV2(vec2 p, vec3 cloudRadiuses) {
    float d1 = sdCircle(p, cloudRadiuses.x);
    float d2 = sdCircle(p - vec2(cloudRadiuses.x, 0.0), cloudRadiuses.y);
    float d3 = sdCircle(p - vec2(-cloudRadiuses.x, 0.0), cloudRadiuses.z);
    float u = sdUnion(d1, d2);
    u = sdUnion(u, d3);

    vec2 shadowOffset = vec2(-25.0, -25.0);
    float d4 = sdCircle(p - shadowOffset, cloudRadiuses.x);
    float d5 = sdCircle(p - vec2(cloudRadiuses.x, 0.0) - shadowOffset, cloudRadiuses.y);
    float d6 = sdCircle(p - vec2(-cloudRadiuses.x, 0.0) - shadowOffset, cloudRadiuses.z);
    float shadowU = sdUnion(d4, d5);
    shadowU = sdUnion(shadowU, d6);

    return vec2(u, shadowU);
}

float sdStar5(in vec2 p, in float r, in float rf)
{
    const vec2 k1 = vec2(0.809016994375, -0.587785252292);
    const vec2 k2 = vec2(-k1.x, k1.y);
    p.x = abs(p.x);
    p -= 2.0 * max(dot(k1, p), 0.0) * k1;
    p -= 2.0 * max(dot(k2, p), 0.0) * k2;
    p.x = abs(p.x);
    p.y -= r;
    vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0, 1);
    float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
    return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}

vec3 sun(vec2 pixelCoords, vec3 color, float sunRadius, float time) {
    const vec3 SUN_COLOR = vec3(1.0, 0.9, 0.1);
    const vec3 SHINE_COLOR = vec3(1.0, 1.0, 0.2);

    vec2 sunPosition = vec2(-600.0, remap(-time, -1.0, 1.0, 450.0, 1400.0));
    float c = sdCircle(pixelCoords - sunPosition, sunRadius);

    color = mix(SHINE_COLOR, color, smoothstep(0.0, 140.0, c));
    color = mix(SUN_COLOR, color, smoothstep(-1.0, 1.0, c));

    return color;
}

vec3 moon(vec2 pixelCoords, vec3 color, float moonRadius, float time) {
    const vec3 MOON_COLOR = vec3(1.0, 0.9, 0.8);
    const vec3 SHINE_COLOR = vec3(1.0, 1.0, 0.2);

    vec2 moonPosition = vec2(500.0, remap(time, -1.0, 1.0, 400.0, 1450.0));
    // vec2 moonPosition = vec2(0.0);
    float c = sdCircle(pixelCoords - moonPosition, moonRadius);
    float c1 = sdCircle(pixelCoords - moonPosition - vec2(-75.0, 30.0), moonRadius);
    float intersected = sdIntersect(c, -c1);

    color = mix(SHINE_COLOR, color, smoothstep(-90.0, 25.0, intersected));
    color = mix(MOON_COLOR, color, smoothstep(-1.0, 1.0, intersected));

    return color;
}

vec3 drawBackground(float time) {
    // rgb(1, 82, 148)
    // rgb(21, 146, 209)
    // rgb(142, 191, 224)
    const float MAX = 255.0;
    const vec3 md1 = vec3(1.0, 82.0, 148.0) / MAX;
    const vec3 md2 = vec3(142.0, 191.0, 224.0) / MAX;

    // rgb(255, 138, 102)
    // rgb(254, 229, 119)
    const vec3 ss1 = vec3(255.0, 138.0, 102.0) / MAX;
    const vec3 ss2 = vec3(254.0, 229.0, 119.0) / MAX;

    // rgb(40, 16, 54)
    // rgb(29, 29, 67)
    const vec3 n1 = vec3(29.0, 29.0, 67.0) / MAX;
    const vec3 n2 = vec3(40.0, 16.0, 54.0) / MAX;

    time = remap(time, -1.0, 1.0, 0.0, 1.0);

    float t = 1.0 - vUv.y;
    vec3 midday = mix(md1, md2, t);
    vec3 sunset = mix(ss1, ss2, t);
    vec3 night = mix(n1, n2, t);

    vec3 mixed = mix(mix(night, sunset, time), midday, time);
    return mixed;

    // float t = vUv.x;
    // return mix(vec3(0.6, 0.4, 0.9), vec3(0.2, 0.2, 0.8), t);
}

float sdQuadraticCircle(in vec2 p)
{
    p = abs(p);
    if (p.y > p.x) p = p.yx;

    float a = p.x - p.y;
    float b = p.x + p.y;
    float c = (2.0 * b - 1.0) / 3.0;
    float h = a * a + c * c * c;
    float t;
    if (h >= 0.0)
    {
        h = sqrt(h);
        t = sign(h - a) * pow(abs(h - a), 1.0 / 3.0) - pow(h + a, 1.0 / 3.0);
    }
    else
    {
        float z = sqrt(-c);
        float v = acos(a / (c * z)) / 3.0;
        t = -z * (cos(v) + sin(v) * 1.732050808);
    }
    t *= 0.5;
    vec2 w = vec2(-t, t) + 0.75 - t * t - p;
    return length(w) * sign(a * a * 0.5 + b - 1.5);
}

const vec3 WHITE = vec3(1.0);
const vec3 BLACK = vec3(0.0);

vec3 drawClouds(vec3 color, vec2 pixelCoords) {
    vec3 smallCloud = vec3(70.0, 45.0, 60.0);
    vec3 mediumCloud = vec3(100.0, 90.0, 92.0);
    vec3 bigCloud = vec3(180.0, 100.0, 130.0);

    float circle = sdCircle(pixelCoords - u_mouse, 50.0);

    float unions = 0.0;
    float shadowUnions = 0.0;
    for (int i = 0; i < 10; i++) {
        vec2 c = cloudV2(pixelCoords - vec2(float(i) * 900.0 + (u_time * -50.0), 0.0), mediumCloud);
        unions = softMax(c.x, -circle, 0.08);
        shadowUnions = softMax(c.y, -circle, 0.08);
        color = mix(BLACK, color, smoothstep(-40.0, 10.0, shadowUnions));
        color = mix(WHITE, color, smoothstep(-1.0, 1.0, unions));
    }

    for (int i = 0; i < 10; i++) {
        vec2 c = cloudV2(pixelCoords - vec2(float(i) * -990.0 + (u_time * 80.0), 169.0), smallCloud);
        unions = softMax(c.x, -circle, 0.08);
        shadowUnions = softMax(c.y, -circle, 0.08);
        color = mix(BLACK, color, smoothstep(-40.0, 10.0, shadowUnions));
        color = mix(WHITE, color, smoothstep(-1.0, 1.0, unions));
    }

    for (int i = 0; i < 10; i++) {
        vec2 c = cloudV2(pixelCoords - vec2(float(i) * 690.0 + (u_time * -20.0), 129.0), mediumCloud);
        unions = softMax(c.x, -circle, 0.08);
        shadowUnions = softMax(c.y, -circle, 0.08);
        color = mix(BLACK, color, smoothstep(-40.0, 10.0, shadowUnions));
        color = mix(WHITE, color, smoothstep(-1.0, 1.0, unions));
    }

    for (int i = 0; i < 30; i++) {
        vec2 c = cloudV2(pixelCoords - vec2(float(i) * -1000.0 + (u_time * 40.0), -289.0), mediumCloud.xzy);
        unions = softMax(c.x, -circle, 0.08);
        shadowUnions = softMax(c.y, -circle, 0.08);
        color = mix(BLACK, color, smoothstep(-40.0, 10.0, shadowUnions));
        color = mix(WHITE, color, smoothstep(-1.0, 1.0, unions));
    }

    for (int i = 0; i < 10; i++) {
        vec2 c = cloudV2(pixelCoords - vec2(float(i) * 890.0 + (u_time * -30.0), -439.0), bigCloud);
        unions = softMax(c.x, -circle, 0.08);
        shadowUnions = softMax(c.y, -circle, 0.08);
        color = mix(BLACK, color, smoothstep(-40.0, 10.0, shadowUnions));
        color = mix(WHITE, color, smoothstep(-1.0, 1.0, unions));
    }

    for (int i = 0; i < 10; i++) {
        vec2 c = cloudV2(pixelCoords - vec2(float(i) * -940.0 + (u_time * 20.0), -100.0), bigCloud.xyy);
        unions = softMax(c.x, -circle, 0.08);
        shadowUnions = softMax(c.y, -circle, 0.08);
        color = mix(BLACK, color, smoothstep(-40.0, 10.0, shadowUnions));
        color = mix(WHITE, color, smoothstep(-1.0, 1.0, unions));
    }
    return color;
}

vec3 star(vec3 color, vec2 p, float radian, float radius, float time) {
    const vec3 STAR_COLOR = vec3(0.98, 0.84, 0.78);
    const vec3 SHINE_COLOR = vec3(1.0, 1.0, 0.2);

    radius = remap(-time, -1.0, 1.0, 0.0, radius);

    float s = sdStar5(p * rotate(radian), radius, radius / 5.0);
    if (radius > 0.04) {
        // color = mix(SHINE_COLOR, color, smoothstep(-10.0, 10.0, s));
    }
    color = mix(STAR_COLOR, color, smoothstep(-1.0, 1.0, s));
    return color;
}

vec3 drawStars(vec3 color, vec2 pixelCoords, float time) {
    for (int i = 0; i < 30; i++) {
        vec2 offset = vec2(900.0 - float(i) * 990.0, 500.0);
        color = star(color, pixelCoords - offset, (u_time + float(i) * 120.0) * (float(i) * 0.05), 10.0, time);
    }
    for (int i = 0; i < 30; i++) {
        vec2 offset = vec2(700.0 - float(i) * 740.0, 350.0);
        color = star(color, pixelCoords - offset, (u_time + float(i) * 120.0) * (float(i) * 0.15), 10.0, time);
    }
    for (int i = 0; i < 30; i++) {
        vec2 offset = vec2(980.0 - float(i) * 640.0, 250.0);
        color = star(color, pixelCoords - offset, (u_time + float(i) * 120.0) * (float(i) * 0.15), 8.0, time);
    }
    return color;
}

void main() {
    vec2 pixelCoords = (vUv - 0.5) * u_resolution;

    float time = sin(u_time * 0.5);

    vec3 color = drawBackground(time);

    color = drawClouds(color, pixelCoords);
    if (time > 0.0) {
        color = sun(pixelCoords, color, 100.0, time);
    } else {
        color = moon(pixelCoords, color, 100.0, time);
    }
    color = drawStars(color, pixelCoords, time);

    gl_FragColor = vec4(color, 1.0);
}
