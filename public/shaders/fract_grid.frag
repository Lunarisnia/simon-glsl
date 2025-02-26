varying vec2 vUv;

uniform vec2 u_resolution;

void main() {
    float aspectRatio = u_resolution.x / u_resolution.y;
    vec2 uv = vUv - 0.5;

    vec2 cell = fract(uv * u_resolution / 100.0);
    cell = abs(cell - 0.5);

    float distToCell = 1.0 - 2.0 * max(cell.x, cell.y);

    float gridLine = smoothstep(0.0, 0.05, distToCell);

    float xAxis = smoothstep(0.0, 0.005, abs(uv.y));
    float yAxis = smoothstep(0.0, 0.005, abs(uv.x));

    vec3 red = vec3(1.0, 0.0, 0.0);
    vec3 green = vec3(0.0, 1.0, 0.0);

    // Lines
    vec2 center = vUv - 0.5;
    vec2 cellPos = center * u_resolution / 100.0;
    float functionLine1 = smoothstep(0.0, 0.05, abs(cellPos.y - abs(cellPos.x)));

    vec3 color = vec3(gridLine);
    color = mix(red, color, xAxis);
    color = mix(red, color, yAxis);
    color = mix(green, color, functionLine1);

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(vec3(yAxis), 1.0);
}
