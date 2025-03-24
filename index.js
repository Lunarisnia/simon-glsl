import * as THREE from 'three';
import fragmentShader from "./public/shaders/raymarch_advanced.frag?raw"
import vertexShader from "./public/shaders/vertex-shaders.vert?raw"

var container;
var camera, scene, renderer, clock;
var uniforms;

init();
animate();

function init() {
	container = document.getElementById('container');

	camera = new THREE.Camera();
	camera.position.z = 1;

	scene = new THREE.Scene();
	clock = new THREE.Clock();

	const colors = [
		new THREE.Color(0xFF0000),
		new THREE.Color(0x00FF00),
		new THREE.Color(0x0000FF),
		new THREE.Color(0xFF00FF),
	];
	const colorFloats = colors.map((c) => c.toArray()).flat();

	var geometry = new THREE.PlaneGeometry(2, 2);
	geometry.setAttribute(
		"simondevColours",
		new THREE.Float32BufferAttribute(colorFloats, 3),
	);

	const loader = new THREE.TextureLoader();
	const dogTexture = loader.load("./textures/dog.jpg");
	const onePixel = loader.load("./textures/onepixel.png");
	const plantTexture = loader.load("./textures/plants.jpg");
	onePixel.minFilter = THREE.NearestFilter;
	onePixel.magFilter = THREE.NearestFilter;
	// Wrap mode
	//dogTexture.wrapS = THREE.MirroredRepeatWrapping;
	//dogTexture.wrapT = THREE.RepeatWrapping;

	uniforms = {
		u_time: { type: "f", value: 1.0 },
		u_resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
		u_mouse: { type: "v2", value: new THREE.Vector2() },
		colour1: { type: "v3", value: new THREE.Vector3(1.0, 1.0, 0.0) },
		colour2: { type: "v3", value: new THREE.Vector3(0.0, 1.0, 1.0) },
		diffuse: { value: dogTexture },
		tex: { value: plantTexture },
		tint: { value: new THREE.Vector3(0.0, 0.0, 1.0) },
	};

	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
	});

	var mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);

	container.appendChild(renderer.domElement);

	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);

	document.onmousemove = function(e) {
		uniforms.u_mouse.value.x = ((e.pageX / window.innerWidth) * 2 - 1) * window.innerWidth;
		uniforms.u_mouse.value.y = (-(e.pageY / window.innerHeight) * 2 + 1) * window.innerHeight;
	}
}

function onWindowResize(event) {
	renderer.setSize(window.innerWidth, window.innerHeight);
	uniforms.u_resolution.value.x = renderer.domElement.width;
	uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	uniforms.u_time.value += clock.getDelta();
	renderer.render(scene, camera);
}
