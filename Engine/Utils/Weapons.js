export const bulletPositionArray2ScreenCoordArray = (bulletPositionArray, bulletNumber, rateX, rateY, recoilForce) =>
{
	// Préparation du tableau des données de sortie
	const bulletDeltaArray = []

	let baseX = bulletPositionArray[0]; // coord x du centre
	let baseY = bulletPositionArray[1]; // coord y du centre

	const pmMX = 960; // coord x du centre de l'écran 1920x1080;
	const pmMy = 540; // coord y du centre de l'écran 1920x1080;

	for (let i = 0; i < bulletNumber; i++) 
	{
		// Calcul de la diff de coord x et y par rapport au centre
		let i2_x = bulletPositionArray[2 * i] - baseX;
		let i2_y = bulletPositionArray[2 * i + 1] - baseY;

		// Conversion de la variation de coord x et y par rapport au centre en fonction du facteur de recul
		i2_x = i2_x * rateX * recoilForce;
		i2_y = i2_y * rateY * recoilForce;

		// Convertis les coords en coord écran
		bulletDeltaArray[2 * i] = pmMX + i2_x;
		bulletDeltaArray[2 * i + 1] = pmMy - i2_y;
	}

	// les coords calculs sont normalisés par rapport au centre de l'écran
	for (let i = 0; i < bulletNumber; i++) {
		bulletDeltaArray[2 * i] = (bulletDeltaArray[2 * i] - pmMX) / pmMX;
		bulletDeltaArray[2 * i + 1] = (bulletDeltaArray[2 * i + 1] - pmMy) / pmMy;
	}

	return bulletDeltaArray;
}

export const bulletDeltaPositionArray2ScreenCoordArray = (bulletPositionArray, bulletNumber, rateX, rateY, recoilForce) => 
{
	// Tableau des coords transformés des balles
	const bulletDeltaArray = []

	let baseX = bulletPositionArray[0]; // coord x du centre
	let baseY = bulletPositionArray[1]; // coord y du centre

	const pmMX = 960; // coord x du centre de l'écran 1920x1080;
	const pmMy = 540; // coord y du centre de l'écran 1920x1080;

	for (let i = 0; i < bulletNumber; i++) 
	{
		// Calcul de la diff de coord x et y par rapport au centre
		let i2_x = bulletPositionArray[2 * i] - baseX;
		let i2_y = bulletPositionArray[2 * i + 1] - baseY;

		// Conversion de la variation de coord x et y par rapport au centre en fonction du facteur de recul
		i2_x = i2_x * rateX * recoilForce;
		i2_y = i2_y * rateY * recoilForce;

		// Convertis les coords en coord écran
		bulletDeltaArray[2 * i] = pmMX + i2_x;
		bulletDeltaArray[2 * i + 1] = pmMy - i2_y;
	}

	// les coords calculs sont normalisés par rapport au centre de l'écran
	for (let i = 0; i < bulletNumber; i++) 
	{
		bulletDeltaArray[2 * i] = (bulletDeltaArray[2 * i] - pmMX) / pmMX;
		bulletDeltaArray[2 * i + 1] = (bulletDeltaArray[2 * i + 1] - pmMy) / pmMy;
	}

	// On recupere les coords normalisées de la premiere balle
	let baseXResolved = bulletDeltaArray[0];
	let baseYResolved = bulletDeltaArray[1];

	for (let i = 0; i < bulletNumber; i++) 
	{
		let i2_x = bulletDeltaArray[2 * i];
		let i2_y = bulletDeltaArray[2 * i + 1];

		// On calcule la diff de coord x et y par rapport à la premiere balle
		bulletDeltaArray[2 * i] = bulletDeltaArray[2 * i] - baseXResolved;
		bulletDeltaArray[2 * i + 1] = bulletDeltaArray[2 * i + 1] - baseYResolved;

		// On met à jour les coords par rapport à la balle précédente
		baseXResolved = i2_x;
		baseYResolved = i2_y;
	}

	return bulletDeltaArray;
}