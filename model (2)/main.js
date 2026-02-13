import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#eef1f5');

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(60, 50, 70);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const container = document.getElementById('scene');
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minPolarAngle = Math.PI / 4;
controls.minDistance = 35;
controls.maxDistance = 120;
controls.target.set(0, 0, 0);

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 0.9);
directional.position.set(60, 80, 30);
directional.castShadow = true;
directional.shadow.mapSize.set(2048, 2048);
scene.add(directional);

const groundGeometry = new THREE.PlaneGeometry(240, 240, 24, 24);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: '#b9d7b6',
  roughness: 0.9,
  metalness: 0.0
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

const positions = groundGeometry.attributes.position;
for (let i = 0; i < positions.count; i += 1) {
  const height = Math.sin(i * 0.3) * 0.6;
  positions.setY(i, height);
}
positions.needsUpdate = true;
scene.add(ground);

const buildingMaterial = new THREE.MeshStandardMaterial({
  color: '#e4e7ec',
  roughness: 0.6,
  metalness: 0.1
});

function addBuilding(width, height, depth, x, z) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, buildingMaterial);
  mesh.position.set(x, height / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

addBuilding(14, 10, 12, 0, 0);
addBuilding(10, 8, 8, 18, -12);
addBuilding(12, 9, 10, -20, 14);
addBuilding(16, 6, 14, 10, 22);
addBuilding(6, 5, 6, -8, -18);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const collapseButton = document.querySelector('.collapse-button');
const sidebar = document.querySelector('.sidebar');

collapseButton.addEventListener('click', () => {
  const isCollapsed = sidebar.classList.toggle('collapsed');
  collapseButton.setAttribute('aria-expanded', String(!isCollapsed));
  if (isCollapsed) {
    gsap.to(sidebar, { height: 52, duration: 0.3, ease: 'power2.out' });
  } else {
    gsap.to(sidebar, { height: 'auto', duration: 0.3, ease: 'power2.out' });
  }
});
