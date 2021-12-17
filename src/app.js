import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'
import { World } from 'cannon-es';
import { DirectionalLightShadow } from 'three';

//ThreeJS
let scene; 
let camera;
let renderer;
let orbitControl;


//CANNON physics
let world;
const timeStep = 1/120;

/** 
 * ThreeJs objects with attached physics CANNON object
 * If you want to visualize a physics object, add its reference to three.js object`s userdata and push to rigidbodies array
 */ 
const rigidBodies = [];

let sphereBody;
const sphereRadius = 0.5;

const ballSpeed = 5;

//Input
const movementInput = {
	up : false,
	down : false,
	right : false, 
	left : false
};

let lastTime = 0;
let lastPlatformPos = 0;

// Order is important!!
initPhysics();
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
	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);
	scene.background = new THREE.Color(0x99AAEE);
	
	camera.position.set(0, 10, 20);
	
	createLights();
	createBall();

	//creates oplatform with hole in it between 1 to 19 if size is 20
	createPlatformWithHole(/*pos*/0, 0, 0,/*size*/ 20, 0.5, 20,/*holes size*/ 0.7, /*hole pos*/ 1, 1);
}

function initPhysics(){
	//world
	world = new CANNON.World({
		gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
	});
}

function createBall(){
	// Create physics ball 
	sphereBody = new CANNON.Body({
		mass: 5, // kg
		shape: new CANNON.Sphere(sphereRadius),
	});
	sphereBody.userdata
	sphereBody.position.set(0, 10, 0);
	world.addBody(sphereBody);

	// Create Three.js ball
	const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius), new THREE.MeshPhongMaterial);
	scene.add(sphereMesh);

	// Connect them
	sphereMesh.userData = sphereBody;
	sphereBody.angularDamping = 0.9;
	rigidBodies.push(sphereMesh);
}

/**
 * Call every frame
 * @param {number} time time since start in milliseconds
**/ 
function update(time) {
	doMovement();

	const deltaTime = (time - lastTime) / 1000;
	updatePhysics(deltaTime);
	lastTime = time;

	orbitControl.update();
	renderer.render(scene, camera);
	
	requestAnimationFrame( update );
}

function updatePhysics(deltaTime){
	
	if (!lastTime) {
	  world.step(timeStep);
	} else {
	  world.step(timeStep, deltaTime);
	}

	// Sync visual objects
	for(let i = 0; i < rigidBodies.length; i++){
		const physicsObj = rigidBodies[i].userData;
		rigidBodies[i].position.copy(physicsObj.position);
		rigidBodies[i].quaternion.copy(physicsObj.quaternion);
	}	
}

/**
 * Setup ligths in the scene
 */
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

/**
 * 
 * @param {float} posX platform`s x position 
 * @param {float} posY platform`s y position
 * @param {float} posZ platform`s z position
 * @param {float} sX platform`s x size
 * @param {flaot} sY platform`s y size
 * @param {float} sZ platform`s z size
 * @param {float} holeRadius radius of the hole
 * @param {float} holeX x position of the hole
 * @param {float} holeZ u position of the hole
 */
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

	// making indecies in bufferGeobetry 
	const indexedGeometry = mergeVertices(geometry);
	
	// center and flip platform
	indexedGeometry.center();
	indexedGeometry.rotateX(Math.PI * -0.5);

	// Making an THREE.Object3D and adding to the scene
	const material = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
	const mesh = new THREE.Mesh(indexedGeometry, material);
	scene.add(mesh);
	
	//physics mesh
	const trimeshShape = new CANNON.Trimesh(indexedGeometry.getAttribute('position').array, indexedGeometry.index.array);
	const physicsBody = new CANNON.Body({
		type: CANNON.Body.STATIC, 
		shape: trimeshShape,
	});
	world.addBody(physicsBody);

	// set position
	mesh.position.set(posX, posY, posZ);
	physicsBody.position.set(posX, posY, posZ);
	
	//link them (not necessarily here since not rigidbody)
	mesh.userData = trimeshShape;
}

function doMovement(){

	const direction = new CANNON.Vec3(0, 0, 0);
	if(movementInput.up){
		direction.z  = -ballSpeed;
	}else if(movementInput.down){
		direction.z  = ballSpeed;
	}

	if(movementInput.right){
		direction.x  = ballSpeed;
	}else if(movementInput.left){
		direction.x  = -ballSpeed;
	}

	if(direction.x != 0 && direction.z != 0){
		direction.normalize();
		sphereBody.angularVelocity.x = direction.z * ballSpeed;
		sphereBody.angularVelocity.z = -direction.x * ballSpeed;

	}

	console.log(sphereBody.angularVelocity);
	
	// sphereBody.velocity.x = direction.x * ballSpeed;
	// sphereBody.velocity.z = direction.z * ballSpeed;
}

/**
 * Calls when window resiezes
**/
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

/**
 *  Calls when a button is pressed or repeat
**/
function onKeyDown(event){
	if(event.key === "1"){
		getRandom()
		lastPlatformPos -= 10;
		createPlatformWithHole(/*pos*/0, lastPlatformPos, 0,/*size*/ 20, 0.5, 20,/*holes size*/ 0.7, /*hole pos*/ getRandom(1, 19), getRandom(1, 19));
	}

	//movement
	if(event.key === "s"){
		movementInput.down = true;
	} else if(event.key === "w"){
		movementInput.up = true;
	}
	
	if(event.key === "d"){
		movementInput.right = true;
	} else if(event.key === "a"){
		movementInput.left = true;
	}
}
function onKeyUp(event){
	//movement
	if(event.key === "s"){
		movementInput.down = false;
	} else if(event.key === "w"){
		movementInput.up = false;
	}
	
	if(event.key === "d"){
		movementInput.right = false;
	} else if(event.key === "a"){
		movementInput.left = false;
	}
}

/**
  * Returns random integer between min and max (included min and max)
**/
function getRandom(min, max){
	return Math.floor(Math.random() * (max - min +1) ) + min;
}