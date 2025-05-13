import { 
    Engine, 
    Scene, 
    ArcRotateCamera, 
    Vector3, 
    HemisphericLight, 
    DirectionalLight,
    PointLight,
    SpotLight,
    ShadowGenerator,
    ActionManager
} from "@babylonjs/core";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader"; 
import "@babylonjs/loaders"; 
import { Animation } from "@babylonjs/core/Animations/animation";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Kamera mengelilingi objek
const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 15, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

scene.clearColor = new Color3(0.02, 0.02, 0.08); // gelap

// Pencahayaan ambient dasar
const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
hemiLight.diffuse = new Color3(0.1, 0.1, 0.3);
hemiLight.groundColor = new Color3(0.02, 0.02, 0.05);
hemiLight.specular = new Color3(0.2, 0.2, 0.4);
hemiLight.intensity = 1.5;

// Tambahkan Directional Light (sinar bulan)
const dirLight = new DirectionalLight("moonLight", new Vector3(-0.5, 20, -0.5), scene);
dirLight.position = new Vector3(10, -20, 10);
dirLight.diffuse = new Color3(0.4, 0.5, 0.8); 
dirLight.specular = new Color3(0.5, 0.6, 0.9);
dirLight.intensity = 5.3;

// Tambahkan Point Light (lampu jalan)
const pointLight = new PointLight("pointLight", new Vector3(0, 5, 0), scene);
pointLight.diffuse = new Color3(1, 0.8, 0.4);
pointLight.specular = new Color3(1.2, 0.9, 0.6);
pointLight.intensity = 50.5;
pointLight.range = 10;

// Tambahkan Spot Light (sorotan ke model)
const spotLight = new SpotLight("spotLight", new Vector3(3, 10, 0), new Vector3(0, -1, 0), Math.PI / 3, 2, scene);
spotLight.intensity = 30.2;
spotLight.diffuse = new Color3(1, 0.8, 0.2); 
spotLight.specular = new Color3(1, 0.8, 0.3); 

const shadowGenerator = new ShadowGenerator(1024, spotLight);
shadowGenerator.useBlurExponentialShadowMap = true;
shadowGenerator.blurKernel = 32;

let porsche; // mesh variable

// For tracking keyboard input
const inputMap = {};
window.addEventListener("keydown", (evt) => {
    inputMap[evt.key.toLowerCase()] = true;
});
window.addEventListener("keyup", (evt) => {
    inputMap[evt.key.toLowerCase()] = false;
});

const loadModel = async () => {
    const result = await SceneLoader.ImportMeshAsync("", "models/", "scene.gltf", scene);
    porsche = result.meshes[0]; // ambil mesh utama

    // Reset posisi awal
    porsche.position = new Vector3(3, 0, 0);

    // Terima bayangan dan aktifkan cast shadow
    porsche.receiveShadows = true;
    shadowGenerator.addShadowCaster(porsche, true);

    // Add interaction to porsche mesh
    porsche.actionManager = new ActionManager(scene);
    
};

const loadRoad = async () => {
    const result = await SceneLoader.ImportMeshAsync("", "roads/", "road.gltf", scene);
    const road = result.meshes[0]; // mesh utama
    // Atur posisi agar berada di bawah mobil, misalnya  
    road.position = new Vector3(0, 0, 0);
    road.scaling = new Vector3(0.5, 0.5, 0.5);
    road.receiveShadows = true;
};

loadModel();
loadRoad();

const moveSpeed = 0.2;

engine.runRenderLoop(() => {
    // gerakan mobilnya berdasarkan input WASD
    if(porsche) {
        if(inputMap["s"]) {
            porsche.position.z -= moveSpeed;
        }
        if(inputMap["w"]) {
            porsche.position.z += moveSpeed;
        }
        if(inputMap["a"]) {
            porsche.position.x -= moveSpeed;
        }
        if(inputMap["d"]) {
            porsche.position.x += moveSpeed;
        }
    }
    scene.render();
});

