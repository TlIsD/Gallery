import * as THREE from 'three';

class Wall{
    constructor(wallSize, wallPosition, wallMaterial, defineDic = {}){
        // wallSize要传参length,height,depth
        // wallPosition要传xyz三个坐标
        // wallMaterial要传color或map键值对,否则墙材质为默认值(黑色)

        // 解构
        this.length = wallSize.length
        this.height = wallSize.height
        this.depth = wallPosition.depth

        this.x = wallPosition.x
        this.y = wallPosition.y
        this.z = wallPosition.z

        if (wallMaterial.color){
            this.color = wallMaterial.color
        }else if(wallMaterial.map){
            this.map = wallMaterial.map
        }

        if (defineDic){
            // 可以传一个depth厚度进来自行自定义
            // 可以自定义墙弧顶的高度highest_point, 建议和天花板搭配使用
            this.depth = defineDic.depth || 0.1
            this.highest_point = defineDic.highest_point || 4
            this.isDoor = defineDic.isDoor || false
            this.doorWidth = defineDic.doorWidth || 0
            this.doorTotalHeight = defineDic.doorTotalHeight || 0
        }
    }

    createWallMaterial(){
        // 构建墙的材质
        let WallMaterial
        if(this.color){
            WallMaterial = new THREE.MeshStandardMaterial({ color: this.color, side: THREE.DoubleSide })
        }else if(this.map){
            const Texture = new THREE.TextureLoader().load(this.map)
            WallMaterial = new THREE.MeshStandardMaterial({ map: Texture, side: THREE.DoubleSide })
        }else {
            WallMaterial = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide })
        }

        return WallMaterial
    }

    createWall(){

        const WallMaterial = this.createWallMaterial()

        // 墙的规格
        const WallGeometry = new THREE.PlaneGeometry(this.length, this.height)

        const wall = new THREE.Mesh(WallGeometry, WallMaterial)

        // 墙的位置
        wall.position.set(this.x, this.y, this.z);

        return wall
    }

    createCurvedWall(){
        const WallMaterial = this.createWallMaterial()

        const WallShape = new THREE.Shape()
        WallShape.moveTo(-this.length / 2, 0)
        WallShape.lineTo(this.length / 2, 0)
        WallShape.lineTo(this.length / 2, this.height)
        WallShape.quadraticCurveTo(0, this.length +this.highest_point, -this.length / 2, this.height)
        WallShape.lineTo(-this.length / 2, 0)

        // 有厚度
        const WallExtrudeSettings = { depth: this.depth, bevelEnabled: false }

        if(this.isDoor){
            // 门洞与CurvedWall同理, 搭建的是一个拱门的门洞
            const doorHole = new THREE.Path();
            doorHole.moveTo(-this.doorWidth / 2, 0);
            doorHole.lineTo(-this.doorWidth / 2, this.doorTotalHeight - 1);
            doorHole.quadraticCurveTo(0, this.doorTotalHeight, this.doorWidth / 2, this.doorTotalHeight - 1);
            doorHole.lineTo(this.doorWidth / 2, 0);
            doorHole.lineTo(-this.doorWidth / 2, 0);
            WallShape.holes.push(doorHole);

            const WallGeometry = new THREE.ExtrudeGeometry(WallShape, WallExtrudeSettings);

            const doorWall = new THREE.Mesh(WallGeometry, WallMaterial)
            doorWall.rotation.y = -Math.PI / 2
            doorWall.position.set(this.x, this.y, this.z)

            return doorWall
        }else{
            const WallGeometry = new THREE.ExtrudeGeometry(WallShape, WallExtrudeSettings)
            WallGeometry.rotateY(Math.PI / 2)
            const curvedWall = new THREE.Mesh(WallGeometry, WallMaterial)

            // 墙的位置
            curvedWall.position.set(this.x, this.y, this.z)

            return curvedWall
        }
    }
}

export default Wall