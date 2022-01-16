import * as THREE from 'three'
import {
  bindMeshToDomObjById,
  setDomToWorldCamera,
  createCardMeshForDomObjbyId,
  createFrameGeometry
} from './lib'
import { createBackdrop } from './backdrop.lib'


import './style.css'

const blockIds = ['#header', '#manifesto', '#section2', '#section3', '#attributions'];

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
setDomToWorldCamera(camera);

const renderer = new THREE.WebGLRenderer({
  alpha: false,
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );


//Static scene elements
const pointLight = new THREE.PointLight( 0xFFFFFF, 0.5 );
pointLight.position.set(20,20,20);

scene.add(pointLight, 0.6);

const pl2 = new THREE.PointLight( 0xDD00FF, 0.7 );
pl2.position.set(0, 30, -80);
scene.add(pl2);

const ambient = new THREE.AmbientLight( 0xFFFFFF, 0.1 );
//scene.add(ambient);


let blockMeshes = [];
function createBlocksByIdList(id) {
  const newBlock = createCardMeshForDomObjbyId(id, 100);
  blockMeshes.push(newBlock);
  scene.add(newBlock);
}

function createBlocks() {
  blockMeshes = [];
  blockIds.forEach((id) => createBlocksByIdList(id));
}

// document.onresize = createBlocks();

function bindMeshes(meshes, ids) {
  let i = 0
  meshes.forEach((mesh) => {
    bindMeshToDomObjById(mesh, ids[i++], 100);
  });
}

let backdrop;
function init() {
  backdrop = createBackdrop()
  backdrop.position.z = -150
  scene.add(backdrop)
}

function animate() {
  const transform = `translateY(${window.scrollY}px)`;
  renderer.domElement.style.transform = transform;

  backdrop.material.uniforms.time.value += 0.01;
  backdrop.material.uniforms.yOffset.value = window.scrollY/5;
  bindMeshes( blockMeshes, blockIds );

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

init();
createBlocks();
animate();