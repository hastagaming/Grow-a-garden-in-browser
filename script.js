import * as THREE from 'three';

// --- SETUP SCENE ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- CAHAYA ---
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(10, 20, 10);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// --- TANAH & PLOT ---
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x4CAF50 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const plots = [];
for(let i = 0; i < 6; i++) {
    const plot = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 4), new THREE.MeshStandardMaterial({ color: 0x795548 }));
    const x = (i % 2) * 8 - 4;
    const z = Math.floor(i / 2) * 8 - 8;
    plot.position.set(x, 0.1, z);
    scene.add(plot);
    plots.push({ mesh: plot, plant: null, stage: 0 });
}

// --- KARAKTER (HUMANOID) ---
const player = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x00A2FF }));
body.position.y = 0.75;
player.add(body);
scene.add(player);

// --- LOGIKA JOYSTICK ---
const knob = document.getElementById('joystick-knob');
const container = document.getElementById('joystick-container');
let moveDir = { x: 0, y: 0 };
let isMoving = false;

container.addEventListener('touchstart', (e) => { isMoving = true; handleMove(e); });
container.addEventListener('touchmove', (e) => { handleMove(e); });
container.addEventListener('touchend', () => { 
    isMoving = false; 
    knob.style.transform = `translate(0px, 0px)`;
    moveDir = { x: 0, y: 0 };
});

function handleMove(e) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touch = e.touches[0];
    
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 40);
    const angle = Math.atan2(dy, dx);
    
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    
    knob.style.transform = `translate(${tx}px, ${ty}px)`;
    
    moveDir.x = Math.cos(angle) * (dist / 40);
    moveDir.y = Math.sin(angle) * (dist / 40);
}

// --- ACTION BUTTON ---
document.getElementById('action-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    plots.forEach(p => {
        const d = player.position.distanceTo(p.mesh.position);
        if(d < 4) {
            if(!p.plant) {
                p.plant = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x00FF00 }));
                p.plant.position.set(p.mesh.position.x, 0.5, p.mesh.position.z);
                scene.add(p.plant);
                p.stage = 1;
            } else if(p.stage < 3) {
                p.stage++;
                p.plant.scale.y += 2;
                p.plant.position.y += 0.2;
            } else {
                scene.remove(p.plant);
                p.plant = null; p.stage = 0;
                document.getElementById('money').innerText = parseInt(document.getElementById('money').innerText) + 10;
            }
        }
    });
});

// --- GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    if(isMoving) {
        player.position.x += moveDir.x * 0.2;
        player.position.z += moveDir.y * 0.2;
        // Biar karakter menghadap arah jalan
        player.rotation.y = -Math.atan2(moveDir.y, moveDir.x) + Math.PI/2;
    }
    
    // Kamera mengikuti karakter (Third Person View)
    camera.position.set(player.position.x, player.position.y + 10, player.position.z + 12);
    camera.lookAt(player.position);
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
