import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js'
import {GUI} from 'lil-gui'
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

						laserMaterial.color.set( params.color );

					} );

				gui.add( params, 'transmission', 0, 1, 0.01 )
					.onChange( function () {

						laserMaterial.transmission = params.transmission;

					} );

				gui.add( params, 'opacity', 0, 1, 0.01 )
					.onChange( function () {

						laserMaterial.opacity = params.opacity;

					} );

				gui.add( params, 'metalness', 0, 1, 0.01 )
					.onChange( function () {

						laserMaterial.metalness = params.metalness;

					} );

				gui.add( params, 'roughness', 0, 1, 0.01 )
					.onChange( function () {

						laserMaterial.roughness = params.roughness;

					} );

				gui.add( params, 'ior', 1, 2, 0.01 )
					.onChange( function () {

						laserMaterial.ior = params.ior;

					} );

				gui.add( params, 'thickness', 0, 5, 0.01 )
					.onChange( function () {

						laserMaterial.thickness = params.thickness;

					} );

				gui.add( params, 'specularIntensity', 0, 1, 0.01 )
					.onChange( function () {

						laserMaterial.specularIntensity = params.specularIntensity;

					} );

				gui.addColor( params, 'specularColor' )
					.onChange( function () {

						laserMaterial.specularColor.set( params.specularColor );

					} );

				gui.add( params, 'envMapIntensity', 0, 1, 0.01 )
					.name( 'envMap intensity' )
					.onChange( function () {

						laserMaterial.envMapIntensity = params.envMapIntensity;

					} );

				gui.add( params, 'exposure', 0, 1, 0.01 )
					.onChange( function () {

						renderer.toneMappingExposure = params.exposure;

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