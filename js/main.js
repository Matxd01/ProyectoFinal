// Importa las bibliotecas necesarias
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/FBXLoader.js";
import { StereoEffect } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/effects/StereoEffect.js";

// Inicializa el renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crea la escena y establece el fondo
const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader()
    .setPath("./images/")
    .load([
        'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'
    ]);

// Crea la cámara estéreo
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 40, 0);
camera.rotation.set(Math.PI / 2, 0, -Math.PI / 2);

// Configura el efecto estéreo
const stereoEffect = new StereoEffect(renderer);
stereoEffect.eyeSeparation = 1;
stereoEffect.setSize(window.innerWidth, window.innerHeight);

// Variables para el control del movimiento
const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 0.3;

// Event listeners para el teclado
window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w = true;
            break;
        case 'KeyA':
            keys.a = true;
            break;
        case 'KeyS':
            keys.s = true;
            break;
        case 'KeyD':
            keys.d = true;
            break;
        case 'Space':
            handleInteraction();
            break;
        case 'KeyX':
            handleExit();
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w = false;
            break;
        case 'KeyA':
            keys.a = false;
            break;
        case 'KeyS':
            keys.s = false;
            break;
        case 'KeyD':
            keys.d = false;
            break;
    }
});

// Función para manejar la interacción
function handleInteraction() {
    const raycaster = new THREE.Raycaster();
    raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));
    const intersects = raycaster.intersectObjects([pointIzquierda, pointDerecha, pointMedio]);

    if (intersects.length > 0) {
        if (intersects[0].object === pointIzquierda) {
            camera.position.x = pointIzquierda.position.x;
            camera.position.z = pointIzquierda.position.z;
        } else if (intersects[0].object === pointDerecha) {
            camera.position.x = pointDerecha.position.x;
            camera.position.z = pointDerecha.position.z;
        } else if (intersects[0].object === pointMedio) {
            camera.position.x = pointMedio.position.x;
            camera.position.z = pointMedio.position.z;
        }
    }
}

// Función para manejar la salida
function handleExit() {
    console.log("Saliendo...");
}

// Verifica si el dispositivo soporta la API de dispositivos de orientación
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleOrientation, false);
} else {
    console.log("El dispositivo no soporta la API de dispositivos de orientación.");
}

// Guarda la rotación inicial de la cámara
const initialRotation = new THREE.Quaternion().copy(camera.quaternion);

// Función para manejar el evento de orientación del dispositivo
function handleOrientation(event) {
    const alpha = THREE.MathUtils.degToRad(event.alpha); // Ángulo de rotación alrededor del eje z (en radianes)
    const beta = THREE.MathUtils.degToRad(event.beta);   // Ángulo de rotación alrededor del eje x (en radianes)
    const gamma = THREE.MathUtils.degToRad(event.gamma); // Ángulo de rotación alrededor del eje y (en radianes)

    const quaternion = new THREE.Quaternion();
    const qAlpha = new THREE.Quaternion();
    qAlpha.setFromAxisAngle(new THREE.Vector3(0, 1, 0), alpha);
    
    const qBeta = new THREE.Quaternion();
    qBeta.setFromAxisAngle(new THREE.Vector3(1, 0, 0), beta);
    
    const qGamma = new THREE.Quaternion();
    qGamma.setFromAxisAngle(new THREE.Vector3(0, 0, 1), gamma - Math.PI);
    
    quaternion.multiply(qAlpha).multiply(qBeta).multiply(qGamma);
    quaternion.multiply(initialRotation);

    camera.quaternion.copy(quaternion);
}

// Carga el objeto FBX
const loader = new FBXLoader();
loader.load('assets/parque.fbx', function (object) {
    object.scale.set(0.1, 0.1, 0.1);
    scene.add(object);
    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);
});

// Crea los puntos de interés
const geometryPoint = new THREE.TorusGeometry(5, 1, 15);
const materialPoint = new THREE.MeshBasicMaterial({ color: 0xffff00 });

const pointMedio = new THREE.Mesh(geometryPoint, materialPoint);
pointMedio.position.set(0, 20, 0);
pointMedio.rotation.set(Math.PI, 0, 0);
scene.add(pointMedio);

const pointIzquierda = new THREE.Mesh(geometryPoint, materialPoint);
pointIzquierda.position.set(118, 20, 0);
pointIzquierda.rotation.set(Math.PI, 0, 0);
scene.add(pointIzquierda);

const pointDerecha = new THREE.Mesh(geometryPoint, materialPoint);
pointDerecha.position.set(-118, 20, 0);
pointDerecha.rotation.set(Math.PI, 0, 0);
scene.add(pointDerecha);

// Crear un punto central
const geometryPointCentral = new THREE.SphereGeometry(0.06, 8, 8);
const materialPointCentral = new THREE.MeshBasicMaterial({ color: 0xfff5f0 });
const pointCentral = new THREE.Mesh(geometryPointCentral, materialPointCentral);
scene.add(pointCentral);

// Función para actualizar la posición del punto central
function updateCentralPointPosition() {
    const direction = new THREE.Vector3(0, 0, -1);
    camera.getWorldDirection(direction);

    const distance = 10;
    const position = new THREE.Vector3();
    position.copy(camera.position).add(direction.multiplyScalar(distance));
    pointCentral.position.copy(position);
}

// Crea un esquema de luces sencillo
const ambientLight = new THREE.AmbientLight(0xFFF3C8, 0.7);
const directionalLight = new THREE.DirectionalLight(0xFFF3C8, 1);
directionalLight.position.set(0, 90, 0);
scene.add(ambientLight);
scene.add(directionalLight);

// Función de animación
function animate() {
    requestAnimationFrame(animate);

    // Mover la cámara basado en las teclas presionadas
    if (keys.w && camera.position.x - moveSpeed >= -200) {
        camera.position.x -= moveSpeed;
    }
    if (keys.a && camera.position.z + moveSpeed <= 200) {
        camera.position.z += moveSpeed;
    }
    if (keys.s && camera.position.x + moveSpeed <= 200) {
        camera.position.x += moveSpeed;
    }
    if (keys.d && camera.position.z - moveSpeed >= -200) {
        camera.position.z -= moveSpeed;
    }

    // Actualiza la posición de pointMedio en el eje Y usando una función sinusoidal
    const amplitude = 1; // Amplitud de la oscilación
    const frequency = 0.003; // Frecuencia de la oscilación
    const offsetY = amplitude * Math.sin(frequency * Date.now());
    pointMedio.position.setY(offsetY + 20);
    pointDerecha.position.setY(offsetY + 20);
    pointIzquierda.position.setY(offsetY + 20);
    updateCentralPointPosition();

    // Renderiza la escena con el efecto estéreo
    stereoEffect.render(scene, camera);
}

// Inicia la animación
animate();
