import { defineConfig } from "vite";
import glsl from 'vite-plugin-glsl';
import wasm from "vite-plugin-wasm";
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

export default defineConfig({
	plugins: [glsl(), wasm()],
	resolve: {
		alias: {
			'@': '/Engine',
			'@Assets': '/Engine/Assets',
			'@Config': '/Engine/Config',
			'@Enums': '/Engine/Config/Enums',
			'@Core': '/Engine/Core',
			'@Game': '/Engine/Game',
			'@Network': '/Engine/Network',
			'@Pipelines': '/Engine/Pipelines',
			'@UI': '/Engine/UI',
			'@Utils': '/Engine/Utils'
		}
	}
})