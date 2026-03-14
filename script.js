import * as THREE from 'three';

// --- SETUP DASAR ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x54A6FF); // Langit biru Roblox

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('game-container').appendChild(renderer.domElement);

// --- CAHAYA ---
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(10, 20, 10);
sun.castShadow = true;
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// --- DUNIA (Baseplate) ---
const gridHelper = new THREE.GridHelper(20, 20, 0xffffff, 0x888888);
scene.add(gridHelper);

const groundGeo = new THREE.BoxGeometry(20, 0.2, 20);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x316e1f });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.y = -0.1;
ground.receiveShadow = true;
scene.add(ground);

// --- LOGIKA TANAMAN ---
let plant = null;
let stage = 0;
let money = 0;

const btnPlant = document.getElementById('btnPlant');
const btnWater = document.getElementById('btnWater');
const moneyDisplay = document.getElementById('money');

function createPart(w, h, d, color) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
}

window.plantSeed = () => {
    if(plant) scene.remove(plant);
    
    // Buat batang kecil (Part hijau)
    plant = createPart(0.4, 0.2, 0.4, 0x00FF00);
    plant.position.y = 0.1;
    scene.add(plant);
    
    stage = 1;
    btnPlant.disabled = true;
    btnWater.disabled = false;
};

window.waterPlant = () => {
    stage++;
    if(stage <= 5) {
        plant.scale.y += 2;
        plant.position.y += 0.2;
    }
    
    if(stage === 5) {
        // Efek Mekar (Part Merah di atas)
        const flower = createPart(1, 1, 1, 0xFF0055);
        flower.position.y = 0.8;
        plant.add(flower);
        
        money += 50;
        moneyDisplay.innerText = money;
        btnWater.innerText = "PANEN";
    }

    if(stage > 5) {
        scene.remove(plant);
        plant = null;
        stage = 0;
        btnWater.innerText = "SIRAM";
        btnWater.disabled = true;
        btnPlant.disabled = false;
    }
};

// Hubungkan tombol ke fungsi
btnPlant.onclick = window.plantSeed;
btnWater.onclick = window.waterPlant;

// --- LOOP ANIMASI ---
function animate() {
    requestAnimationFrame(animate);
    if(plant) plant.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
