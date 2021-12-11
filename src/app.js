import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'

let scene; 
let camera;
let renderer;
let orbitControl;

let lastPlatformPos = 0;

const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
  })

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
	document.addEventListener('keypress', onKeyPressed)
	scene.background = new THREE.Color(0xEEEEEE);

	//origin
	const origin = new THREE.Mesh( new THREE.BoxGeometry(1.2), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
	scene.add( origin );
	camera.position.set(0, 10, 20);

	createLights();

	//creates oplatform with hole in it between 1 to 19 if size is 20
	createPlatformWithHole(/*pos*/0, 0, 0,/*size*/ 20, 0.5, 20,/*holes size*/ 0.7, /*hole pos*/ 19, 6);
}

function createLights(){
	//ambient light
	const ambientLight = new THREE.AmbientLight(0x444444);
	scene.add(ambientLight);

	//directional light
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.target.position.set(-0.5, 0, 0);
	scene.add(directionalLight.target);
	scene.add(directionalLight);
}

function createPlatformWithHole(posX, posY, posZ, sX, sY, sZ, holeRadius, holeX, holeZ){

	// Making platform by "drawing" it like 2d
	const rectShape = new THREE.Shape()
		.moveTo(0, 0)
		.lineTo(sX, 0)
		.lineTo(sX, sZ)
		.lineTo(0, sZ)
		.lineTo(0, 0);

	// Making hole in it
	const hole = new THREE.Path()
	.moveTo(0, 0)
	.absarc(holeX, holeZ, holeRadius, 0, Math.PI * 2, false);
	rectShape.holes.push(hole);

	// extrude platform
	const extrudeSettings = {
		depth: sY,
		steps: 1,
		bevelEnabled: false
	};
	const geometry = new THREE.ExtrudeBufferGeometry(rectShape, extrudeSettings);

	// center and flip platform
	geometry.center();
	geometry.rotateX(Math.PI * -0.5);

	// Making an THREE.Object3D and adding to the scene
	const material = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(posX, posY, posZ);
	scene.add(mesh);
}

// Call every frame
function update(time) {

	orbitControl.update();
	renderer.render(scene, camera);

	requestAnimationFrame( update );
}

// Calls when window resiezes
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

// Calls when a button is pressed
function onKeyPressed(event){
	if(event.key === "1"){
		lastPlatformPos -= 10;
		createPlatformWithHole(/*pos*/0, lastPlatformPos, 0,/*size*/ 20, 0.5, 20,/*holes size*/ 0.7, /*hole pos*/ getRandom(1, 19), getRandom(1, 19));
		console.log(getRandom(1, 19));
	}
}
function getRandom(min, max){
	return Math.floor(Math.random() * (max - min +1) ) + min;
}