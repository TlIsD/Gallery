import * as CANNON from 'cannon-es'

class AirWall{
    constructor(airWallSize, airWallPosition){
        // airWallSize要传参length和height和depth
        // airWallPosition要传xyz三个坐标
        this.airWallSize = airWallSize
        this.airWallPosition = airWallPosition
    }

    createAirWall(){
        let length, height, depth, x, y, z

        if (this.airWallSize.length && this.airWallSize.height && this.airWallSize.depth
            && this.airWallPosition.x && this.airWallPosition.y && this.airWallPosition.z){
            length = this.airWallSize.length
            height = this.airWallSize.height
            depth = this.airWallSize.depth
            x = this.airWallPosition.x
            y = this.airWallPosition.y
            z = this.airWallPosition.z
        }else{
            console.error('airWallSize或airWallPosition传参错误')
        }

        const airWallShape = new CANNON.Box(new CANNON.Vec3(length, height, depth))

        // 返回一个Body
        return new CANNON.Body({
            mass: 0,
            shape: airWallShape,
            position: new CANNON.Vec3(x, y, z),
        })
    }
}


export default AirWall