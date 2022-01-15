import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { bindMeshToDomObjById, setDomToWorldCamera, createCardMeshForDomObjbyId} from './lib'

import './style.css'

const blockIds = ['#header', '#manifesto', '#section2', '#section3', '#attributions'];

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
setDomToWorldCamera(camera);
const raycaster = new THREE.Raycaster();

const renderer = new THREE.WebGLRenderer({
  //alpha: true,
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

const geo = new THREE.TorusGeometry( 10, 3, 16, 100 );
const mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
const torus = new THREE.Mesh( geo, mat );
torus.position.z = -30;

scene.add( torus );

const pointLight = new THREE.PointLight( 0xFFFFFF, 0.5 );
pointLight.position.set(20,20,20);

scene.add(pointLight);

const pl2 = new THREE.PointLight( 0xDD00FF, 0.7 );
pl2.position.set(0, 30, -80);
scene.add(pl2);

const ambient = new THREE.AmbientLight( 0xFFFFFF, 0.1 );
scene.add(ambient);


let blockMeshes = [];
function createBlocksByIdList(id) {
  const newBlock = createCardMeshForDomObjbyId(id, 100);
  blockMeshes.push(newBlock);
  scene.add(newBlock);
}

function createBlocks() {
  blockIds.forEach((id) => createBlocksByIdList(id));
}

document.onresize = createBlocks();

function bindMeshes(meshes, ids) {
  let i = 0
  meshes.forEach((mesh) => {
    bindMeshToDomObjById(mesh, ids[i++], 100);
  });
}

function animateTorus(torus) {
  torus.geometry.attributes.position.array.forEach((pos) => {
    //console.log(pos);
  })
}

function animate() {
  const transform = `translateY(${window.scrollY}px)`;
  renderer.domElement.style.transform = transform;

  bindMeshes( blockMeshes, blockIds );

  bindMeshToDomObjById(torus, '#quote-1', 100);
  animateTorus(torus)
  
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

animate();