import { EquirectangularReflectionMapping, LinearFilter } from "three";
import Map from "@Core/Map";

export default class MiniMap extends Map
{
	constructor() 
	{
		super();

		this.initialize();
	}

	initialize()
	{
		this.scene = this.engine.resources.get('map').scene;

		this.engine.scenes.level.add(this.scene);

		this.environment = this.engine.resources.get('sunset');
		this.environment.mapping = EquirectangularReflectionMapping;
		this.environment.magFilter = LinearFilter;

		this.engine.scenes.level.environment = this.environment;
	}
}