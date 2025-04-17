import * as THREE from 'three';

class Record{
    constructor(radius, height, url){
        this.radius = radius;
        this.height = height;
        this.url = url;
    }

    add(scene, galleryLength, galleryWidth, wallHeight){
        const recordTextureLoader = new THREE.TextureLoader()
        const recordTexture = recordTextureLoader.load(this.url)
        const recordMaterWithTexture = new THREE.MeshStandardMaterial({ map: recordTexture });

        const recordGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 64);
        const record = new THREE.Mesh(recordGeometry, recordMaterWithTexture);

        // 设置唱片的初始位置
        record.rotation.x = Math.PI;
        record.rotation.z = Math.PI / 2; // 将唱片绕垂直轴旋转90度

        // 将唱片挂在门旁
        record.position.set(galleryLength / 2 + 0.1, wallHeight / 2, galleryWidth / 2 - 11.6);

        // 将唱片添加到场景中
        scene.add(record)

        return record
    }



}

export default Record