import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'
import GUI from 'lil-gui'; 

export function SceneManager(canvas){


    //ThreeJS
    let scene; 
    let camera;
    let renderer;
    let orbitControl;


    const backroundColor = new THREE.Color(0xb9b8d3);
    const ballColor = new THREE.Color(0x3066BE);
    const platformColor = new THREE.Color(0x4C956C);

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

    let pointLight, pointLight2;

    //Input
    const movementInput = {
        up : false,
        down : false,
        right : false, 
        left : false
    };

    let lastTime = 0;
    let lastPlatformPos = 0;
    const distanceBetweenPlatforms = 15;

    //GUI
    const gui = new GUI();

    const settings = {
        ballSpeed : 100,
        cameraHeight : 1
    }

    // Order is important!!
    initPhysics();
    init();

    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 500 );
        renderer = new THREE.WebGLRenderer({canvas : canvas, antialias : true});

        orbitControl = new OrbitControls(camera, renderer.domElement);
        orbitControl.enableDamping = true;
        orbitControl.dampingFactor = 0.15;
        orbitControl.maxPolarAngle = 1;
        orbitControl.minPolarAngle = 1;
        orbitControl.maxDistance = 25;
        orbitControl.minDistance = 5;
        orbitControl.enablePan = false;

        renderer.shadowMap.enabled = true;
        scene.background = backroundColor;
        renderer.setSize(canvas.width, canvas.height);
        
        camera.position.set(0, 10, 20);
        
        // Order matters!!
        createBall();
        createLights();
        createGui();
        //creates oplatform with hole in it between 1 to 19 if size is 20
        createPlatformWithHole(/*pos*/0, 0, 0,/*size*/ 20, 0.5, 20,/*holes size*/ 0.7, /*hole pos*/ 8, 8);
    }

    function initPhysics(){
        //world
        world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82 * 2, 0), // m/s²
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
        const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius), new THREE.MeshPhongMaterial({color : ballColor}));
        sphereMesh.castShadow = true;
        scene.add(sphereMesh);

        // Connect them
        sphereMesh.userData = sphereBody;
        sphereBody.angularDamping = 0.995;
        rigidBodies.push(sphereMesh);
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

    function createGui(){
        gui.add(settings, 'ballSpeed', 0, 1000);
        gui.add(settings, 'cameraHeight', 0, Math.PI).onChange((value) => {
            orbitControl.maxPolarAngle = value;
            orbitControl.minPolarAngle = value;
        });
        gui.add(orbitControl, 'minDistance', 0, 50);
        gui.add(orbitControl, 'maxDistance', 0, 50);



    }

    /**
     * Setup ligths in the scene
     */
    function createLights(){
        //ambient light
        const ambientLight = new THREE.AmbientLight(0x555555);
        scene.add(ambientLight);

        // Point light
        pointLight = new THREE.PointLight(new THREE.Color(1, 1, 1), 1);
        pointLight.position.x = camera.position.x;
        pointLight.position.y = camera.position.y;
        pointLight.position.z = camera.position.z;
        scene.add(pointLight); 


        
        // //directional light
        // directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        // directionalLight.position.set(3,30,0);
        // directionalLight.target.position.set(-3, 0, 0);
        // directionalLight.castShadow = true;
        // directionalLight.shadow.mapSize.width = 1024;
        // directionalLight.shadow.mapSize.height = 1024;
        
        // directionalLight.shadow.camera.left = -10;
        // directionalLight.shadow.camera.right = 10;
        // directionalLight.shadow.camera.top = 10;
        // directionalLight.shadow.camera.bottom = -10;
        // // directionalLight.shadow.camera.near = 0.5; 
        // // directionalLight.shadow.camera.far = 500;
        // scene.add(directionalLight.target);
        // scene.add(directionalLight);
        // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));


    }

    /**
     * 
     * @param {number} posX platform`s x position 
     * @param {number} posY platform`s y position
     * @param {number} posZ platform`s z position
     * @param {number} sX platform`s x size
     * @param {number} sY platform`s y size
     * @param {number} sZ platform`s z size
     * @param {number} holeRadius radius of the hole
     * @param {number} holeX x position of the hole
     * @param {number} holeZ u position of the hole
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
        const material = new THREE.MeshPhongMaterial({color: platformColor});
        const mesh = new THREE.Mesh(indexedGeometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

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

        //obstacles
    }

    function doMovement(){

        const direction = new CANNON.Vec3(0, 0, 0);
        if(movementInput.up){
            direction.z  = -settings.ballSpeed;
        }else if(movementInput.down){
            direction.z  = settings.ballSpeed;
        }

        if(movementInput.right){
            direction.x  = settings.ballSpeed;
        }else if(movementInput.left){
            direction.x  = -settings.ballSpeed;
        }

        if(direction.x != 0 || direction.z != 0){
            direction.normalize();
            // sphereBody.angularVelocity.x = direction.z * settings.ballSpeed;
            // sphereBody.angularVelocity.z = -direction.x * settings.ballSpeed;
            sphereBody.applyTorque(new CANNON.Vec3(direction.z * settings.ballSpeed, 0, -direction.x * settings.ballSpeed));
        }

        
        // sphereBody.velocity.x = direction.x * settings.ballSpeed;
        // sphereBody.velocity.z = direction.z * settings.ballSpeed;
    }

    /**
     *  Calls when a button is pressed or repeat
    **/

    /**
     * Returns random integer between min and max (included min and max)
    **/
    function getRandom(min, max){
        return Math.floor(Math.random() * (max - min +1) ) + min;
    }

    /**
     * Call every frame
     * @param {number} time time since start in milliseconds
    **/ 
    this.update = function(time){
        doMovement();

        const deltaTime = (time - lastTime) / 1000;
        updatePhysics(deltaTime);
        lastTime = time;

        orbitControl.target.set(0, sphereBody.position.y, 0);
        pointLight.position.x = camera.position.x;
        pointLight.position.y = camera.position.y;
        pointLight.position.z = camera.position.z;


        orbitControl.update();
        renderer.render(scene, camera);
    }

    this.onWindowResize = function(){
        camera.aspect = canvas.innerWidth / canvas.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( canvas.width, canvas.height );
    }
    
    this.onKeyDown = function(event){
        if(event.key === "1"){
            getRandom()
            lastPlatformPos -= distanceBetweenPlatforms;
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

    this.onKeyUp = function (event){
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
}