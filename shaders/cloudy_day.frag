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

vec3 drawBackground() {
    float t = vUv.x;
    return mix(vec3(0.6, 0.4, 0.9), vec3(0.2, 0.2, 0.8), t);
}

vec3 drawClouds(vec3 color, vec2 pixelCoords) {
    vec3 smallCloud = vec3(70.0, 45.0, 60.0);
    vec3 mediumCloud = vec3(100.0, 90.0, 92.0);
    vec3 bigCloud = vec3(180.0, 100.0, 130.0);
    for (int i = 0; i < 10; i++) {
        vec3 c = cloud(pixelCoords - vec2(float(i) * 900.0 + (u_time * -50.0), 0.0), color, mediumCloud);
        color = c;
    }

    for (int i = 0; i < 10; i++) {
        vec3 c = cloud(pixelCoords - vec2(float(i) * -990.0 + (u_time * 80.0), 169.0), color, smallCloud);
        color = c;
    }

    for (int i = 0; i < 10; i++) {
        vec3 c = cloud(pixelCoords - vec2(float(i) * 690.0 + (u_time * -20.0), 129.0), color, mediumCloud);
        color = c;
    }

    for (int i = 0; i < 30; i++) {
        vec3 c = cloud(pixelCoords - vec2(float(i) * -1000.0 + (u_time * 40.0), -289.0), color, mediumCloud.xzy);
        color = c;
    }

    for (int i = 0; i < 10; i++) {
        vec3 c = cloud(pixelCoords - vec2(float(i) * 890.0 + (u_time * -30.0), -439.0), color, bigCloud);
        color = c;
    }

    for (int i = 0; i < 10; i++) {
        vec3 c = cloud(pixelCoords - vec2(float(i) * -940.0 + (u_time * 20.0), -100.0), color, bigCloud.xyy);
        color = c;
    }
    return color;
}

void main() {
    vec2 pixelCoords = (vUv - 0.5) * u_resolution;

    float time = sin(u_time * 0.5);

    vec3 color = drawBackground();
    color = drawClouds(color, pixelCoords);
    if (time > 0.0) {
        color = sun(pixelCoords, color, 100.0, time);
    } else {
        color = moon(pixelCoords, color, 100.0, time);
    }

    gl_FragColor = vec4(color, 1.0);
}
