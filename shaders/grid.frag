varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

const vec3 RED = vec3(0.9, 0.3, 0.2);
const vec3 BLUE = vec3(0.2, 0.23, 0.95);

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

vec3 drawVignette() {
    float distToCenter = length(abs(vUv - 0.5));

    float invertedDist = 1.0 - distToCenter;
    invertedDist = smoothstep(0.05, 0.6, invertedDist);
    invertedDist = remap(invertedDist, 0.0, 1.0, 0.3, 1.0);

    return vec3(invertedDist);
}

vec3 drawGrid(vec3 color, vec3 gridColor, float cellSpacing, float lineWidth) {
    vec2 center = vUv - 0.5;
    vec2 cell = fract(center * u_resolution / cellSpacing);
    cell = abs(cell - 0.5);

    float distToCell = (0.5 - max(cell.x, cell.y)) * cellSpacing;

    float gridLine = smoothstep(0.0, lineWidth, distToCell);

    vec3 grid = mix(gridColor, color, gridLine);
    return grid;
}

float sdfCircle(vec2 position, float radius) {
    return length(position) - radius;
}

float sdEquilateralTriangle(in vec2 p, in float r)
{
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0 * r, 0.0);
    return -length(p) * sign(p.y);
}

float softMax(float a, float b, float k) {
    return log(exp(k * a) + exp(k * b)) / k;
}

float softMin(float a, float b, float k) {
    return -softMax(-a, -b, k);
}

void main() {
    vec2 uv = vUv;
    vec2 pixelCoords = (uv - 0.5) * u_resolution;

    vec3 color = drawVignette();
    color = drawGrid(color, vec3(0.6), 10.0, 1.0);
    color = drawGrid(color, vec3(0.0), 100.0, 3.0);

    float d = sdfCircle(pixelCoords - u_mouse, 300.0);

    float t1 = sdEquilateralTriangle(pixelCoords - vec2(400.0, 0.0), 300.0);
    float t2 = sdEquilateralTriangle(pixelCoords - vec2(400.0, -400.0), 300.0);

    float unionTd = softMin(d, softMin(t1, t2, 0.02), 0.02);
    color = mix(BLUE * 0.5, color, smoothstep(-1.0, 1.0, unionTd));
    color = mix(BLUE, color, smoothstep(-8.0, 0.0, unionTd));

    gl_FragColor = vec4(color, 1.0);
}
