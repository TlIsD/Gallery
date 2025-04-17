import * as THREE from 'three';
import leftWall from "../main";

// 创建添加画类
class Painting{
    constructor(url) {
        this.url = url;
    }

    setName(name) {
        this.name = name;
    }

    setArtist(artist) {
        this.artist = artist;
    }

    add(wallHeight, position, num) {
        // wallHeight为墙高 position为画要放的墙 num传入这是这面墙的第几幅画

        const baseNode = new THREE.Object3D();
        let x, z, width, height
        const y = wallHeight / 2 - 0.5
        // 左墙
        if (position === 'left'){
            x = 1
            baseNode.position.set(x, y, z);
            baseNode.rotation.y = -Math.PI / 2;
            width = 6
            height = 7
        }

        if (position === 'front'){
            z = 14
            x = num*12 - 5
            baseNode.position.set(x, y, z);
            width = 11
            height = 8;
        }

        if (position === 'back'){
            z = -15
            x = num*12 - 5
            baseNode.position.set(x, y, z);
            baseNode.rotation.y = Math.PI;
            width = 11
            height = 8;
        }

        const paintingLoader = new THREE.TextureLoader();
        const paintingTexture = paintingLoader.load(this.url)
        const painting = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, 0.01),
            new THREE.MeshStandardMaterial({ map: paintingTexture })
        )

        painting.position.z = -0.01;
        baseNode.add(painting);

        // 添加画框
        const border = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.3, height + 0.3, 0.005),
            new THREE.MeshStandardMaterial({ color: 0x303030 })
        )
        border.position.z = -0.005;
        baseNode.add(border);

        // 全按照leftWall定位的，第4个值只能传leftWall
        leftWall.add(baseNode);

        // 返回画作，便于交互
        return painting
    }

    MoveOnPainting(){
        const box = document.getElementById('info')
        const title = document.getElementById('title');
        const artist = document.getElementById('artist');
        box.style.display = 'block';
        title.innerHTML = this.name;
        artist.innerHTML = this.artist;
    }
}

export default Painting;

