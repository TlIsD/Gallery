import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import * as TWEEN from 'tween';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import Painting from'./paintingAdd.js';
import Record from "./recordAdd";

// 初始化准星
const raycaster = new THREE.Raycaster(undefined, undefined, 0.1, 10);
const mouse = new THREE.Vector2();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.0;
document.body.appendChild(renderer.domElement);

const galleryLength = 50;  // 房间长度
const galleryWidth = 30;   // 房间宽度
const wallHeight = 10;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(galleryLength/2 + 10, 5, 0);
camera.lookAt(galleryLength/2, 5, 0);

const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);

// 创建天花板
const ceilingSegW = 40, ceilingSegH = 40;
const ceilingGeometry = new THREE.PlaneGeometry(galleryLength, galleryWidth, ceilingSegW, ceilingSegH);
ceilingGeometry.rotateX(Math.PI / 2);
ceilingGeometry.translate(0, wallHeight - 0.01, 0);
const posAttr = ceilingGeometry.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  const z = posAttr.getZ(i);
  const factor = Math.abs(z) / (galleryWidth / 2);
  const offset = (1 - factor * factor) * 2.0;
  posAttr.setY(i, posAttr.getY(i) + offset);
}
posAttr.needsUpdate = true;

// 天花板材质
const ceilingTextureLoader = new THREE.TextureLoader();
const ceilingTexture = ceilingTextureLoader.load('./public/ceiling.png');
const ceilingWithTexture = new THREE.MeshStandardMaterial({ map: ceilingTexture });
const ceiling = new THREE.Mesh(ceilingGeometry, ceilingWithTexture);
scene.add(ceiling);

// 墙体材质
const wallTextureLoader1 = new THREE.TextureLoader();
const wallTexture1 = wallTextureLoader1.load('./public/wall.png')
const wallMaterWithTexture1 = new THREE.MeshStandardMaterial({ map: wallTexture1 })

const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffa500 })

// 创建后墙
const backWallGeometry = new THREE.PlaneGeometry(galleryLength, wallHeight);
const backWall = new THREE.Mesh(backWallGeometry, wallMaterWithTexture1);
backWall.position.set(0, wallHeight / 2, -galleryWidth / 2);
scene.add(backWall);

// 创建前墙
const frontWallGeometry = new THREE.PlaneGeometry(galleryLength, wallHeight);
const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterWithTexture1);
frontWall.position.set(0, wallHeight / 2, galleryWidth / 2);
frontWall.rotation.y = Math.PI;
scene.add(frontWall);


// 创建左墙
const leftWallShape = new THREE.Shape();
leftWallShape.moveTo(-galleryWidth / 2, 0);
leftWallShape.lineTo(galleryWidth / 2, 0);
leftWallShape.lineTo(galleryWidth / 2, wallHeight);
leftWallShape.quadraticCurveTo(0, wallHeight + 4, -galleryWidth / 2, wallHeight);
leftWallShape.lineTo(-galleryWidth / 2, 0);
const leftWallExtrudeSettings = { depth: 0.1, bevelEnabled: false };
const leftWallGeometry = new THREE.ExtrudeGeometry(leftWallShape, leftWallExtrudeSettings);
leftWallGeometry.rotateY(Math.PI / 2);
const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
leftWall.position.set(-galleryLength / 2, 0, 0);

export default leftWall

scene.add(leftWall);

// 创建右墙（带门）
const doorWidth = 4;
const doorTotalHeight = 7;
const rightWallShape = new THREE.Shape();
rightWallShape.moveTo(-galleryWidth / 2, 0);
rightWallShape.lineTo(galleryWidth / 2, 0);
rightWallShape.lineTo(galleryWidth / 2, wallHeight);
rightWallShape.quadraticCurveTo(0, wallHeight + 4, -galleryWidth / 2, wallHeight);
rightWallShape.lineTo(-galleryWidth / 2, 0);
const doorHole = new THREE.Path();
doorHole.moveTo(-doorWidth / 2, 0);
doorHole.lineTo(-doorWidth / 2, doorTotalHeight - 0.5);
doorHole.quadraticCurveTo(0, doorTotalHeight, doorWidth / 2, doorTotalHeight - 0.5);
doorHole.lineTo(doorWidth / 2, 0);
doorHole.lineTo(-doorWidth / 2, 0);
rightWallShape.holes.push(doorHole);
const wallExtrudeSettings = { depth: 0.1, bevelEnabled: false };
const rightWallGeometry = new THREE.ExtrudeGeometry(rightWallShape, wallExtrudeSettings);
const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.set(galleryLength / 2, 0, 0);
scene.add(rightWall);

rightWall.renderOrder = 1;

// 门材质
const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
const doorThickness = 0.05;
const doorPanelWidth = doorWidth / 2;
const doorPanelHeight = doorTotalHeight;

// 左门扇
const leftDoorGeom = new THREE.BoxGeometry(doorPanelWidth, doorPanelHeight, doorThickness);
leftDoorGeom.translate(doorPanelWidth / 2, 0, 0);
const leftDoorPanel = new THREE.Mesh(leftDoorGeom, doorMaterial);
const leftDoorPivot = new THREE.Object3D();
leftDoorPivot.position.set(-doorWidth / 2, doorPanelHeight / 2, 0.05);
leftDoorPivot.add(leftDoorPanel);

// 右门扇
const rightDoorGeom = new THREE.BoxGeometry(doorPanelWidth, doorPanelHeight, doorThickness)
rightDoorGeom.translate(-doorPanelWidth / 2, 0, 0);
const rightDoorPanel = new THREE.Mesh(rightDoorGeom, doorMaterial);
const rightDoorPivot = new THREE.Object3D();
rightDoorPivot.position.set(doorWidth / 2, doorPanelHeight / 2, 0.05);
rightDoorPivot.add(rightDoorPanel);

rightWall.add(leftDoorPivot);
rightWall.add(rightDoorPivot);

let DoorOpen = false
const DoorOpenAngle = - Math.PI / 2;
const DoorCloseAngle = 0;

// 开门动画
function ToggleDoor(){
  const target = DoorOpen ? DoorCloseAngle : DoorOpenAngle;
  new TWEEN.Tween(leftDoorPivot.rotation)
      .to({y: target}, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(()=>{
        rightDoorPivot.rotation.y = -leftDoorPivot.rotation.y
      })
      .onComplete(()=>{
        DoorOpen = !DoorOpen;
      })
      .start()
}

// 添加画(左墙)
const url = './public/MonaLisa.jpg';
const position = 'left'
// 初始化
const painting = new Painting(url)
painting.setName('蒙娜丽莎')
painting.setArtist('达芬奇')
const p1 = painting.add(wallHeight, position)

// 添加画（前墙）

const front_urlList = [
    './public/spring.jpg',
    './public/stars.jpg',
    './public/sunday.jpg',
    './public/wave.jpg',
]

const front_paintingList = [
    '吉维尼的春天',
    '星月夜',
    '大碗岛的星期天下午',
    '神奈川冲浪里'
]

const front_artistList = [
    '莫奈',
    '梵高',
    '乔治·修拉',
    '葛饰北斋'
]

const paintingMesh = [p1,]

const paintings = [painting,]

for (let i = 0; i < front_urlList.length; i++) {
  const position = 'front'
  const painting = new Painting(front_urlList[i]);
  paintings.push(painting);

  const p_mesh = painting.add(wallHeight, position, i+1);
  painting.setName(front_paintingList[i])
  painting.setArtist(front_artistList[i])

  paintingMesh.push(p_mesh)
}



// 创建光源
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 5).normalize();
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// 创建镜面反射
const mirror = new Reflector(
    new THREE.CircleGeometry(40, 64),
    {
      color: 0x505050,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
    }
);
mirror.position.set(0, 0, 0);
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

let moveSpeed = 0.1;
let keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

// 创建唱片模型
const recordRadius = 1; // 唱片半径
const recordHeight = 0.05; // 唱片厚度
const recordImgSrc = './public/one_last_kiss.jpg'

const record = new Record(recordRadius, recordHeight, recordImgSrc)
const recordMesh = record.add(scene, galleryLength, galleryWidth, wallHeight)

// 预加载音频
const musicUrl = './public/OneLastKiss.flac'
const music = record.setAudio(musicUrl)

// 唱片动画
function rotateRecord(){
  new TWEEN.Tween(recordMesh.rotation)
      .to({ x: recordMesh.rotation.x - Math.PI * 2 }, 5000)
      .easing(TWEEN.Easing.Linear.None)
      .start()
      .onComplete(function (){
        rotateRecord()
      })
}

function animate() {
  TWEEN.update();
  raycaster.intersectObjects(scene.children);

  renderer.render(scene, camera);

  const cameraPosition = camera.position;

  // 基于视线方向来控制相机移动
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction); // 获取相机的前方方向
  direction.y = 0;  // 保持在水平面上

  direction.normalize();  // 将方向向量标准化

  // 控制键盘输入的移动方向
  if (keys.w) {
    cameraPosition.addScaledVector(direction, moveSpeed);
  }
  if (keys.s) {
    cameraPosition.addScaledVector(direction, -moveSpeed);
  }
  if (keys.a) {
    const left = new THREE.Vector3(direction.z, 0, -direction.x);  // 计算左侧方向
    left.normalize();
    cameraPosition.addScaledVector(left, moveSpeed);
  }
  if (keys.d) {
    const right = new THREE.Vector3(-direction.z, 0, direction.x);  // 计算右侧方向
    right.normalize();
    cameraPosition.addScaledVector(right, moveSpeed);
  }

  if (cameraPosition.z < -galleryWidth / 2) {
    cameraPosition.z = -galleryWidth / 2;
  }

  controls.update();
  renderer.render(scene, camera);
}

// 监听键盘事件
function onKeyDown(event) {
  if (event.code === 'KeyW') keys.w = true;
  if (event.code === 'KeyA') keys.a = true;
  if (event.code === 'KeyS') keys.s = true;
  if (event.code === 'KeyD') keys.d = true;
}

function onKeyUp(event) {
  if (event.code === 'KeyW') keys.w = false;
  if (event.code === 'KeyA') keys.a = false;
  if (event.code === 'KeyS') keys.s = false;
  if (event.code === 'KeyD') keys.d = false;
}

function onMouseDown() {
  controls.lock()
}

function onMouseClick() {
  // 光标位置固定在中心
  mouse.x = 0;
  mouse.y = 0;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([leftDoorPanel, rightDoorPanel, recordMesh]);

  if (intersects.length > 0){
    const object = intersects[0].object;
    if (object === leftDoorPanel || object === rightDoorPanel) {
      ToggleDoor()
    }else if (object === recordMesh){
      rotateRecord()
      record.audioPlay(music)
    }
    console.log('点击了物体:', object);
  }
}

// 监听鼠标移动
function onMouseMove(){
  mouse.x = 0;
  mouse.y = 0;

  // 检测鼠标是否在画上
  raycaster.setFromCamera(mouse, camera);

  const intersects = []

  for (let i = 0; i < paintingMesh.length; i++) {
    const intersect = raycaster.intersectObject(paintingMesh[i])
    intersects.push(intersect)
  }

  console.log(intersects)

  for (let i = 0; i < intersects.length; i++) {

    if (intersects[i].length > 0){
      const object = intersects[i][0].object;

      if (object === paintingMesh[i]){
        paintings[i].MoveOnPainting()
      }else {
        const box = document.getElementById('info')
        box.style.display = 'none'
      }

      break

    }else {
      const box = document.getElementById('info')
      box.style.display = 'none'
    }
  }
}

window.addEventListener('click', onMouseClick);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


