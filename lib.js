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

// x,y Bottom Left (origin) of shape
function createRoundedRect(x, y, width, height, radius) {
  const pi = Math.PI;
  return new THREE.Path()
    .moveTo( x, y + height - radius )
    .arc(radius, 0, radius, pi, pi/2, true)
    .lineTo( x + width - radius, y + height)
    .arc(0, -radius, radius, pi/2, 2*pi, true)
    .lineTo( x + width, y + radius )
    .arc(-radius, 0, radius, 2*pi, (3*pi)/2, true)
    .lineTo( x + radius, y)
    .arc(0, radius, radius, (3*pi)/2, pi, true)
}

function createFrameShape(width, height, radius, innerWidth, innerHeight, innerRadius) {
  let shape = new THREE.Shape(createRoundedRect(0, 0, width, height, radius).getPoints());
  shape.holes.push(createRoundedRect(
    (width - innerWidth)/2,
    (height - innerHeight)/2,
    innerWidth,
    innerHeight,
    innerRadius
  ));
  return shape;
}

export function createFrameGeometry(
	width,
	height,
	radius,
	innerWidth,
	innerHeight,
	innerRadius,
	depth,
	bevelRadius,
	bevelSegments,
	curveSegments
) {
	//return new THREE.ShapeGeometry(createFrameShape(width, height, radius, innerWidth, innerHeight, innerRadius))
	return new THREE.ExtrudeGeometry(
		createFrameShape(width, height, radius, innerWidth, innerHeight, innerRadius),
		{
			depth: depth - radius * 2,
			bevelEnabled: true,
			bevelSegments: bevelSegments,
			steps: 1,
			bevelSize: bevelRadius,
			bevelThickness: bevelRadius,
			curveSegments: curveSegments
		}
	).center();
}
  

function pixelToScreen1D(a, windowDimension) {
	return -(( a / windowDimension ) * 2 - 1);
}

function pixelToScreenX(x) {
	//console.log("p2s x: " + x);
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
	//console.log("screen coords: " + screenCoords.x + ", " + screenCoords.y);
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

export function boundingRectToWorldDimensions(boundingRect, distance) {
	return {
		width: boundingRectToWorldWidth(boundingRect, distance),
		height: boundingRectToWorldHeight(boundingRect, distance)
	}
}

export function createCardMeshForDomObj(domObj, distance) {
	const dimensions = boundingRectToWorldDimensions(domObj.getBoundingClientRect(), distance);
	const frameGeometery = createFrameGeometry(
		dimensions.width,
		dimensions.height,
		4, 
		dimensions.width - 10, 
		dimensions.height - 10,
		2, 10, 2, 3, 5
	);
	const frameMaterial = new THREE.MeshStandardMaterial({
		color: 0xFFFFFF,
		wireframe: false,
		side: THREE.DoubleSide,
	});
	const screenGeometery = new THREE.BoxGeometry(
		dimensions.width - 1,
		dimensions.height - 1,
		5
	);
	const sreenMaterial = new THREE.MeshBasicMaterial({
		color: 0x000000
	});
	const screen = new THREE.Mesh( screenGeometery, sreenMaterial );
	return new THREE.Mesh( frameGeometery, frameMaterial ).add(screen);
}

export function createCardMeshForDomObjbyId(id, distance) { 
	return createCardMeshForDomObj(document.querySelector(id), distance);
}
