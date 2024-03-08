import * as THREE from 'three';

export const traverseGraph = (object, callback) => {
	object.traverse((child) => {
		callback(child);
	});
};

export const createTexture = (src) => {
	const image = new Image();
	const texture = new THREE.Texture(image);
	image.src = src;
	image.onload = () => { texture.needsUpdate = true; }
	return texture;
}
