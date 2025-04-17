import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import * as TWEEN from 'tween';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

import Painting from './AddElement/paintingAdd';
import Record from "./AddElement/recordAdd";
import Bench from "./AddElement/benchAdd";
import Wall from "./AddElement/wallAdd";

// 初始化准星和判定距离
const raycaster = new THREE.Raycaster(undefined, undefined, 0.1, 10);
const mouse = new THREE.Vector2();

// 初始化渲染器
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
camera.position.set(galleryLength/2 + 10, 2, 0);
camera.lookAt(galleryLength/2, 3, 0);

const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);


// 创建光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
directionalLight.position.set(5, 10, 5).normalize();
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.8, 100)
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// 创建镜面地板
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




// 前后墙数据
const front_backWallSize = {
  'length': galleryLength - 0.2,
  'height': wallHeight,
}

const front_backWallMaterial = {
  'map': './public/wall.png'
}

const frontWallPosition = {
  'x': 0,
  'y': wallHeight / 2,
  'z': galleryWidth / 2,
}

const backWallPosition = {
  'x': 0,
  'y': wallHeight / 2,
  'z': -galleryWidth / 2,
}

// 创建前墙和后墙
const backWall = new Wall(front_backWallSize, backWallPosition, front_backWallMaterial)
const frontWall = new Wall(front_backWallSize, frontWallPosition, front_backWallMaterial)
scene.add(backWall.createWall())
scene.add(frontWall.createWall())


// 左右墙数据
const left_rightWallSize = {
  'length': galleryWidth,
  'height': wallHeight,
}

const left_rightWallMaterial = {
  'color': 0xff3c00,
}

const leftWallPosition = {
  'x': -galleryLength / 2,
  'y': 0,
  'z': 0,
}

const rightWallPosition ={
  'x': galleryLength / 2,
  'y': 0,
  'z': 0,
}

const leftWall = new Wall(left_rightWallSize, leftWallPosition, left_rightWallMaterial).createCurvedWall()
scene.add(leftWall)

export default leftWall

const doorWidth = 7.5;
const doorTotalHeight = 7;

const dic = {'isDoor': true, 'doorWidth': doorWidth, 'doorTotalHeight': doorTotalHeight}

// 创建右墙（带门洞）
const rightWall = new Wall(left_rightWallSize, rightWallPosition, left_rightWallMaterial, dic).createCurvedWall()
scene.add(rightWall)


const TextureLoader = new THREE.TextureLoader();

// 门材质
const doorTexture = TextureLoader.load('./public/door.png')
const doorMaterial = new THREE.MeshStandardMaterial({ map: doorTexture });
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

const paintingMesh = [p1,]

// 画作信息
const paintings = [painting,]

// 添加画（前墙）
const front_urlList = [
    './public/Sunrise.jpg',
    './public/stars.jpg',
    './public/sunday.jpg',
    './public/wave.jpg',
]

const front_paintingList = [
    '日出‧印象',
    '星夜',
    '大碗岛的星期天下午',
    '神奈川冲浪里'
]

const front_artistList = [
    '克劳德·莫内',
    '文森特·梵高',
    '乔治·修拉',
    '葛饰北斋'
]

for (let i = 0; i < front_urlList.length; i++) {
  const position = 'front'
  const painting = new Painting(front_urlList[i]);
  paintings.push(painting);

  const p_mesh = painting.add(wallHeight, position, i+1);
  painting.setName(front_paintingList[i])
  painting.setArtist(front_artistList[i])

  paintingMesh.push(p_mesh)
}

// 添加画(后墙)
const back_urlList = [
  './public/Adam.jpg',
  './public/freedom.jpg',
  './public/NightWatch.jpg',
  './public/Guernica.jpg',
]

const back_paintingList = [
  '创造亚当',
  '自由引导人民',
  '夜巡',
  '格尔尼卡'
]

const back_artistList = [
  '米开朗基罗',
  '欧仁·德拉克罗瓦',
  '伦勃朗',
  '巴勃罗·毕加索'
]

for (let i = 0; i < back_urlList.length; i++) {
  const position = 'back'
  const painting = new Painting(back_urlList[i]);
  paintings.push(painting);

  const p_mesh = painting.add(wallHeight, position, i+1);
  painting.setName(back_paintingList[i])
  painting.setArtist(back_artistList[i])

  paintingMesh.push(p_mesh)
}


// 创建唱片模型
const recordRadius = 0.8; // 唱片半径
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

// 添加长凳
const bench1 = new Bench(0, 0).createBench()
scene.add(bench1)

const bench2 = new Bench(10 , 0).createBench(0x8b4513)
scene.add(bench2)

const bench3 = new Bench(-10 , 0).createBench(0xffccff)
scene.add(bench3)


// 移动
let moveSpeed = 0.1;
let keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

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
    // console.log('点击了物体:', object);
  }
}

// 监听鼠标移动事件
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


// 响应式布局
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


