import * as THREE from 'three';

import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';


class SimonDevGLSLCourse {
	constructor() {
	}

	async initialize() {
		this.threejs_ = new THREE.WebGLRenderer();
		document.body.appendChild(this.threejs_.domElement);

		window.addEventListener('resize', () => {
			this.onWindowResize_();
		}, false);

		this.scene_ = new THREE.Scene();

		this.camera_ = new THREE.PerspectiveCamera(60, 1920.0 / 1080.0, 0.1, 1000.0);
		this.camera_.position.set(1, 0, 3);

		const controls = new OrbitControls(this.camera_, this.threejs_.domElement);
		controls.target.set(0, 0, 0);
		controls.update();

		const loader = new THREE.CubeTextureLoader();
		const texture = loader.load([
			'./resources/Cold_Sunset__Cam_2_Left+X.png',
			'./resources/Cold_Sunset__Cam_3_Right-X.png',
			'./resources/Cold_Sunset__Cam_4_Up+Y.png',
			'./resources/Cold_Sunset__Cam_5_Down-Y.png',
			'./resources/Cold_Sunset__Cam_0_Front+Z.png',
			'./resources/Cold_Sunset__Cam_1_Back-Z.png',
		]);

		this.scene_.background = texture;

		await this.setupProject_();

		this.onWindowResize_();
		this.raf_();
	}

	async setupProject_() {
		const vsh = await fetch('./shaders/vertex-shaders.vert');
		const vsh2 = await fetch('./shaders/vertex-shaders.vert');
		const fsh = await fetch('./shaders/blin_phong.frag');
		const fsh2 = await fetch('./shaders/ambient.frag');

		const material = new THREE.ShaderMaterial({
			uniforms: {
				specMap: {
					value: this.scene_.background,
				}
			},
			vertexShader: await vsh.text(),
			fragmentShader: await fsh.text()
		});
		const material2 = new THREE.ShaderMaterial({
			uniforms: {
				specMap: {
					value: this.scene_.background,
				}
			},
			vertexShader: await vsh2.text(),
			fragmentShader: await fsh2.text()
		});

		const loader = new GLTFLoader();
		loader.setPath('./resources/');
		loader.load('suzanne.glb', (gltf) => {
			gltf.scene.traverse(c => {
				c.material = material;
			});
			//gltf.scene.position.set(-1.5, 0, 0);
			this.scene_.add(gltf.scene);
		});
		loader.load('suzanne.glb', (gltf) => {
			gltf.scene.traverse(c => {
				c.material = material2;
			});
			gltf.scene.position.set(1.5, 0, 0);
			//this.scene_.add(gltf.scene);
		});

		this.onWindowResize_();
	}

	onWindowResize_() {
		this.threejs_.setSize(window.innerWidth, window.innerHeight);

		this.camera_.aspect = window.innerWidth / window.innerHeight;
		this.camera_.updateProjectionMatrix();
	}

	raf_() {
		requestAnimationFrame((t) => {
			this.threejs_.render(this.scene_, this.camera_);
			this.raf_();
		});
	}
}


let APP_ = null;

window.addEventListener('DOMContentLoaded', async () => {
	APP_ = new SimonDevGLSLCourse();
	await APP_.initialize();
});
