import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Engine from "@/Engine";

export default class Map 
{
	constructor() 
	{
		this.engine = new Engine();

		this.isReady = false;
	}

	async loadModel(source)
	{
		new GLTFLoader().loadAsync(source).then(() => this.setReady(true));
	}

	setReady(toggle)
	{
		this.isReady = toggle;
	}
}