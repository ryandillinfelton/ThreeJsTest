import * as THREE from 'three'
import { boundingRectToWorldDimensions } from './lib'

export function createBackdrop() {
    const dimensions = boundingRectToWorldDimensions(document.querySelector('#bg').getBoundingClientRect(), 150);
    const planeGeo = new THREE.PlaneGeometry(dimensions.width, dimensions.height)

    const shaderMat = new THREE.ShaderMaterial( {
        uniforms: {
            time: { value: 1.0 },
            resolution: { value: new THREE.Vector2() },
            yOffset: { value: 0.0 }
        },
        vertexShader: document.getElementById( 'backdropVS' ).textContent,
        fragmentShader: document.getElementById( 'backdropFS' ).textContent
    });

    return new THREE.Mesh( planeGeo, shaderMat );
}