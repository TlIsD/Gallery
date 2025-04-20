import * as THREE from 'three'

class NewPainting {
    constructor(size, position, angle, url){
        // 传入大小(长宽)
        this.width = size.width
        this.height = size.height

        // 传入坐标
        this.x = position.x
        this.y = position.y
        this.z = position.z

        // 传入旋转角度(推荐-180～180)
        this.angle_x = angle.x || 0
        this.angle_y = angle.y || 0
        this.angle_z = angle.z || 0

        // 如果想一次构建多幅画就直接传列表
        this.url = url
    }

    setName(name){
        this.name = name
    }

    setArtist(artist){
        this.artist = artist
    }

    createPainting(color = 0, map = null){
        const baseNode = new THREE.Object3D()
        const paintingLoader = new THREE.TextureLoader()
        const paintingTextureLoader = paintingLoader.load(this.url)

        const painting = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, 0.01),
            new THREE.MeshBasicMaterial({map: paintingTextureLoader})
        )

        painting.position.z = -0.01
        baseNode.add(painting)

        // 画框材质(只要设置一个就行）
        let material
        if (color){
            material = new THREE.MeshBasicMaterial({color: color})
        }else if(map){
            material = new THREE.MeshBasicMaterial({map: map})
        }else {
            material = new THREE.MeshBasicMaterial({color: 0x000000})
        }

        // 添加画框
        const border = new THREE.Mesh(
            new THREE.BoxGeometry(this.width + 0.3, this.height + 0.3, 0.005),
            material
        )
        border.position.z = -0.005
        baseNode.add(border)

        baseNode.rotation.x = Math.PI * (this.angle_x / 180)
        baseNode.rotation.y = Math.PI * (this.angle_y / 180)
        baseNode.rotation.z = Math.PI * (this.angle_z / 180)

        baseNode.position.set(this.x, this.y, this.z)

        // 返回baseNode用于挂载，返回painting用于交互
        return [baseNode, painting]
    }

    // createPaintings(nameList, artistList, color = 0, interval){
    //     // 因为懒所以就写了一个方向的，要反方向就传个负值吧，别的方向可以重写一下我的方法
    //
    //     const paintings = []
    //     const paintingsClass = []
    //
    //     for (let i = 0; i < this.url.length; i++){
    //         this.url = this.url[i]
    //         const painting = this.createPainting(color)
    //         this.setName(nameList[i])
    //         this.setArtist(artistList[i])
    //
    //         paintingsClass.push(this)
    //         paintings.push(painting)
    //
    //         // todo其他方向主要改这个地方
    //         this.x += interval
    //     }
    //     // todo 优化返回值
    //
    //     return [paintingsClass, paintings]
    // }

    MoveOnPainting(){
        // 鼠标移动到画作上显示相关信息
        const box = document.getElementById('info')
        const title = document.getElementById('title')
        const artist = document.getElementById('artist')
        box.style.display = 'block'
        title.innerHTML = this.name
        artist.innerHTML = this.artist
    }
}

export default NewPainting