import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js'
import {GUI} from 'lil-gui.js'
//ThreeJS
let scene; 
let camera;
let renderer;
let orbitControl;

let composer;
let laserMaterial;

const params = {
	color: 0xffffff,
	transmission: 1,
	opacity: 1,
	metalness: 0,
	roughness: 0,
	ior: 1.5,
	thickness: 0.01,
	specularIntensity: 1,
	specularColor: 0xffffff,
	envMapIntensity: 1,
	lightIntensity: 1,
	exposure: 1
};

init();
update();



function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 500 );
	renderer = new THREE.WebGLRenderer({antialias : true});
	orbitControl = new OrbitControls(camera, renderer.domElement);
	
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize );
	scene.background = new THREE.Color(0x99AAEE);
	
	camera.position.set(0, 10, 20);

	const envGenerator = new PMREMGenerator(renderer);
	scene.environment = envGenerator.fromScene(new RoomEnvironment()).texture;
	createLaser();
	createGUI();
}

function createLaser(){
	laserMaterial = new THREE.MeshPhysicalMaterial( {
		color: params.color,
		metalness: params.metalness,
		roughness: params.roughness,
		ior: params.ior,
		envMapIntensity: params.envMapIntensity,
		transmission: params.transmission, // use material.transmission for glass materials
		specularIntensity: params.specularIntensity,
		specularColor: params.specularColor,
		opacity: params.opacity,
		side: THREE.DoubleSide,
		transparent: true
	} );
	const laserMesh = new THREE.Mesh(
		new THREE.BoxGeometry(10, 1, 10),
		laserMaterial
	);
	scene.add(laserMesh);
}

function createGUI(){
	const gui = new GUI();

				gui.addColor( params, 'color' )
					.onChange( function () {

						material.color.set( params.color );
						render();

					} );

				gui.add( params, 'transmission', 0, 1, 0.01 )
					.onChange( function () {

						material.transmission = params.transmission;
						render();

					} );

				gui.add( params, 'opacity', 0, 1, 0.01 )
					.onChange( function () {

						material.opacity = params.opacity;
						render();

					} );

				gui.add( params, 'metalness', 0, 1, 0.01 )
					.onChange( function () {

						material.metalness = params.metalness;
						render();

					} );

				gui.add( params, 'roughness', 0, 1, 0.01 )
					.onChange( function () {

						material.roughness = params.roughness;
						render();

					} );

				gui.add( params, 'ior', 1, 2, 0.01 )
					.onChange( function () {

						material.ior = params.ior;
						render();

					} );

				gui.add( params, 'thickness', 0, 5, 0.01 )
					.onChange( function () {

						material.thickness = params.thickness;
						render();

					} );

				gui.add( params, 'specularIntensity', 0, 1, 0.01 )
					.onChange( function () {

						material.specularIntensity = params.specularIntensity;
						render();

					} );

				gui.addColor( params, 'specularColor' )
					.onChange( function () {

						material.specularColor.set( params.specularColor );
						render();

					} );

				gui.add( params, 'envMapIntensity', 0, 1, 0.01 )
					.name( 'envMap intensity' )
					.onChange( function () {

						material.envMapIntensity = params.envMapIntensity;
						render();

					} );

				gui.add( params, 'exposure', 0, 1, 0.01 )
					.onChange( function () {

						renderer.toneMappingExposure = params.exposure;
						render();

					} );

				gui.open();
}

function update(time) {

	orbitControl.update();
	renderer.render(scene, camera);
	
	requestAnimationFrame( update );
}

/**
 * Calls when window resiezes
**/
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}