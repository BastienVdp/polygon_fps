import * as THREE from 'three';
import Engine from '@/Engine';
import { GameEventPipe, BulletImpactEvent } from "@Pipes/GameEventPipe";

export default class Hole 
{
	static instance;

	constructor()
	{
		if (Hole.instance) {
			return Hole.instance;
		}
		Hole.instance = this;

		this.engine = new Engine();
		this.scene = this.engine.scenes.level;

		this.bulletHoles = [];

		this.opacity = .8;
		this.scale = .05;
		this.exitTime = 5;
		this.fadeTime = .1;

		this.index = 0;

		this.bulletHoleGeometry = new THREE.CircleGeometry(0.5, 32); // 0.5 est le rayon, 32 est le nombre de segments
        this.bulletHoleMaterial = new THREE.MeshLambertMaterial({ 
			color: 0x000000, 
			transparent: true, 
			opacity: this.opacity, 
			polygonOffset: true,
			polygonOffsetFactor: -4,
			polygonOffsetUnits: -4,
		});
		
		this.initialize();
	}

	initialize() {
		GameEventPipe.addEventListener(BulletImpactEvent.type, (e) => {
			this.addPoint(e.detail.point, e.detail.normal);
		});
	}
	

	addPoint(point, normal)
	{
		const geo = this.bulletHoleGeometry.clone();
		const mat = this.bulletHoleMaterial.clone();

		// Créer un nouveau mesh pour le trou de balle
		const mesh = new THREE.Mesh(geo, mat);
	
		// Positionner le mesh
		mesh.position.copy(point);
		
		// Orienter le mesh en fonction de la normale
		const quaternion = new THREE.Quaternion();
		quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 0), normal); // Ajuster en fonction de votre orientation préférée
		mesh.quaternion.copy(quaternion);
	
		// var normal = face.normal.clone();
		// normal.applyQuaternion(normal)
		// normal.normalize();
		mesh.name = 'bulletHole_' + this.bulletHoles.length;
		// Ajuster l'échelle et l'opacité
		mesh.scale.set(this.scale, this.scale, this.scale);

		// Ajouter le mesh à la scène
		this.scene.add(mesh);
		this.bulletHoles.push({
			mesh,
			createdAt: this.engine.time.elapsed,
		});
	}

	update()
	{
		const currentTime = this.engine.time.elapsed;

        this.bulletHoles.forEach(bulletHoleData => {
            const { mesh, createdAt } = bulletHoleData;
            const age = currentTime - createdAt; // en millisecondes

            if (age > this.exitTime) {
                // Le temps pour disparaître est écoulé
                this.scene.remove(mesh);
				this.bulletHoles.splice(this.bulletHoles.indexOf(bulletHoleData), 1);
            } else if (age > (this.exitTime - this.fadeTime)) {
                // Phase de disparition
                const fadeProgress = (this.exitTime - age) / (this.fadeTime);

                mesh.material.opacity = Math.max(0, fadeProgress);
				mesh.material.needsUpdate = true;
            }

        });
	}
}