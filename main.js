import { insertCoin } from "playroomkit";
import Engine from "./Engine/Engine";

const engine = new Engine();

insertCoin().then(() => {
  engine.start();
});

window.Engine = engine;
