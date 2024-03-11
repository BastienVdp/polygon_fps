varying vec2 vUv;

void main()
{
	float circleStrength = smoothstep(0.03, 0.04, distance(vUv, vec2(0.5)));
	float crossStrength = 1.0 - step(0.0001, abs(vUv.x - 0.5)) * step(0.0001, abs(vUv.y - 0.5));
	float strength = max(circleStrength, crossStrength);
    vec4 color = vec4(vec3(0.0), strength); // Utilisation de 1.0 - strength pour rendre le blanc transparent
    gl_FragColor = color;
}