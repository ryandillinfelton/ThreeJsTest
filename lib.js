import * as THREE from 'three'
let camera;

export function setDomToWorldCamera(inCamera) {
    camera = inCamera;
}

export function createBoxWithRoundedEdges( width, height, depth, radius0, smoothness ) {
    let shape = new THREE.Shape();
    let eps = 0.00001;
    let radius = radius0 - eps;
    shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
    shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
    shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
    shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );
    let geometry = new THREE.ExtrudeBufferGeometry( shape, {
      depth: depth - radius0 * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius0,
      curveSegments: smoothness
    });
    
    geometry.center();
    
    return geometry;
}

function pixelToScreen1D(a, windowDimension) {
    return -(( a / windowDimension ) * 2 - 1);
}

function pixelToScreenX(x) {
    console.log("p2s x: " + x);
    return pixelToScreen1D(x, window.innerWidth);
}

function pixelToScreenY(y) {
    return pixelToScreen1D(y, window.innerHeight);
}

// normalizes pixel coordinates
export function pixelToScreen(coordinates) {
    return new THREE.Vector2(
        -pixelToScreenX(coordinates.x),
        pixelToScreenY(coordinates.y)
    );
}

// returns pixelcoords
export function getBoundingRectCenter(boundingRect) {
    return new THREE.Vector2(
        (boundingRect.left + boundingRect.width/2),
        (boundingRect.top + boundingRect.height/2)
    )
}

export function screenToWorld(screenCoords, distance) {
    console.log("screen coords: " + screenCoords.x + ", " + screenCoords.y);
    return new THREE.Vector3( screenCoords.x, screenCoords.y, -1 ).unproject( camera ).multiplyScalar(distance);
}

export function bindMeshToDomObj(mesh, domObj, distance) {
    const screenCoords = pixelToScreen(getBoundingRectCenter(domObj.getBoundingClientRect()));
    const worldPos = screenToWorld(screenCoords, distance);
    mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
}

export function bindMeshToDomObjById(mesh, id, distance) {
    bindMeshToDomObj(mesh, document.querySelector(id), distance);
}

function boundingRectToWorldWidth(boundingRect, distance) {
    const worldLeft = screenToWorld(new THREE.Vector2(pixelToScreenX(boundingRect.left), 0), distance);
    const worldRight = screenToWorld(new THREE.Vector2(pixelToScreenX(boundingRect.right), 0), distance);
    return worldLeft.distanceTo(worldRight); 
}

function boundingRectToWorldHeight(boundingRect, distance) {
    const worldTop = screenToWorld(new THREE.Vector2(0, pixelToScreenY(boundingRect.top)), distance);
    const worldBottom = screenToWorld(new THREE.Vector2(0, pixelToScreenY(boundingRect.bottom)), distance);
    return worldTop.distanceTo(worldBottom); 
}

function boundingRectToWorldDimensions(boundingRect, distance) {
    return {
        width: boundingRectToWorldWidth(boundingRect, distance),
        height: boundingRectToWorldHeight(boundingRect, distance)
    }
}

export function createCardMeshForDomObj(domObj, distance) {
    const dimensions = boundingRectToWorldDimensions(domObj.getBoundingClientRect(), distance);
    const geometery = createBoxWithRoundedEdges(
        dimensions.width,
        dimensions.height, 
        10, 3, 10
    );
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
    })
    return new THREE.Mesh( geometery, material );
}

export function createCardMeshForDomObjbyId(id, distance) {
    return createCardMeshForDomObj(document.querySelector(id), distance);
}
