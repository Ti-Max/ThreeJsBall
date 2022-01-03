//https://pierfrancesco-soffritti.medium.com/how-to-organize-the-structure-of-a-three-js-project-77649f58fa3f
import { SceneManager } from "./SceneManager";

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sceneManager = new SceneManager(canvas);

addEventListeners();
render();

function addEventListeners(){
    window.addEventListener( 'resize', onWindowResize );
    document.addEventListener('keydown', sceneManager.onKeyDown);
	document.addEventListener('keyup', sceneManager.onKeyUp);
}

function onWindowResize (){
    canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;

    sceneManager.onWindowResize();
}

function render() {
    requestAnimationFrame(render);
    sceneManager.update();
}