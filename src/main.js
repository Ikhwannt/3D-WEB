import { 
    Engine, 
    Scene, 
    ArcRotateCamera, 
    Vector3, 
    HemisphericLight, 
    DirectionalLight,
    PointLight,
    SpotLight,
    ShadowGenerator
} from "@babylonjs/core";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader"; 
import "@babylonjs/loaders"; 
import { Animation } from "@babylonjs/core/Animations/animation";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Kamera mengelilingi objek
const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 10, Vector3.Zero(), scene);
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

const loadModel = async () => {
    const result = await SceneLoader.ImportMeshAsync("", "models/", "scene.gltf", scene);
    const porsche = result.meshes[0]; // ambil mesh utama

    // Reset posisi awal (opsional)
    porsche.position = new Vector3(3, 0, 0);

    // Terima bayangan dan aktifkan cast shadow
     porsche.receiveShadows = true;
     shadowGenerator.addShadowCaster(porsche, true);

    // Animasi gerakan maju di sumbu Z
    const moveForward = new Animation(
        "moveForward",
        "position.z",
        30, // 30 fps
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE // supaya looping
    );

    // Buat mobil jalan dari -50 ke 50, lalu kembali ke -50 (loop)
    const keyFrames = [
        { frame: 0, value: -50 },
        { frame: 150, value: 50 } // jalan 50 satuan dalam 5 detik (30x5 = 150)
    ];

    moveForward.setKeys(keyFrames);

    // Tambahkan animasi ke mobil
    porsche.animations = [moveForward];

    // Mulai animasi
    scene.beginAnimation(porsche, 0, 150, true); // true = looping
};

const loadRoad = async () => {
    const result = await SceneLoader.ImportMeshAsync("", "roads/", "road.gltf", scene);
    const road = result.meshes[0]; // mesh utama
  
    // Atur posisi agar berada di bawah mobil, misalnya
    road.position = new Vector3(0, 0, 0);
  
    // Skala kalau terlalu kecil/besar
    road.scaling = new Vector3(0.5,0.5,0.5);

    // Biar jalan terima bayangan
    road.receiveShadows = true;
  };

loadModel();
loadRoad();

engine.runRenderLoop(() => scene.render());