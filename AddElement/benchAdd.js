import * as THREE from 'three';

class Bench {
    constructor(x, z){
        this.x = x
        this.z = z
    }

    createBench(color = null){
        const bench = new THREE.Group();

        // 可以自定义长凳颜色(默认为白色)
        let benchMaterial = new THREE.MeshLambertMaterial({ color: color });


        const seatWidth = 6, seatDepth = 1, seatThickness = 0.15;
        const legHeight = 0.6;
        const seatGeometry = new THREE.BoxGeometry(seatWidth, seatThickness, seatDepth);
        const seat = new THREE.Mesh(seatGeometry, benchMaterial);
        seat.position.set(0, legHeight + seatThickness/2, 0);
        bench.add(seat);

        const legRadius = 0.1;
        const legGeometry = new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 16);
        const offsets = [
            [-seatWidth/2 + legRadius, 0, -seatDepth/2 + legRadius],
            [ seatWidth/2 - legRadius, 0, -seatDepth/2 + legRadius],
            [-seatWidth/2 + legRadius, 0,  seatDepth/2 - legRadius],
            [ seatWidth/2 - legRadius, 0,  seatDepth/2 - legRadius]
        ];
        offsets.forEach(offset => {
            const leg = new THREE.Mesh(legGeometry, benchMaterial);
            leg.position.set(offset[0], legHeight/2, offset[2]);
            bench.add(leg);
        });
        bench.position.set(this.x, 0, this.z);

        return bench;
    }
}

export default Bench;
