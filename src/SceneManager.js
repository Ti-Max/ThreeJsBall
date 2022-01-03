import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'
import GUI from 'lil-gui'; 

export class SceneManager{

    constructor(canvas){
        this.canvas = canvas;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, canvas.innerWidth / canvas.innerHeight, 0.1, 500 );
        this.renderer = new THREE.WebGLRenderer({canvas : canvas, antialias : true});
        this.renderer.setSize(canvas.width, canvas.height);
    }
    update(){

    }
    onWindowResize(){
    //     camera.aspect = window.innerWidth / window.innerHeight;
    //     camera.updateProjectionMatrix();
    
        this.renderer.setSize( canvas.width, canvas.height );
    }
}