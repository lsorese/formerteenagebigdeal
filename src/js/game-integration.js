// Game integration logic
let gameLoaded = false;
let gameOverlay = null;

document.addEventListener('DOMContentLoaded', function() {
	const gameButton = document.getElementById('gameButton');
	const mainLayout = document.querySelector('.main-layout');
	
	gameButton.addEventListener('click', function() {
		// Create full-screen game overlay if it doesn't exist
		if (!gameOverlay) {
			gameOverlay = document.createElement('div');
			gameOverlay.id = 'gameOverlay';
			
			// Create close button
			const closeButton = document.createElement('button');
			closeButton.id = 'gameCloseButton';
			closeButton.textContent = '×';
			
			closeButton.addEventListener('click', function() {
				// Fade out game and fade in site content
				gameOverlay.style.opacity = '0';
				mainLayout.style.opacity = '1';
				
				setTimeout(() => {
					gameOverlay.style.display = 'none';
					// Restore page scroll
					document.body.style.overflow = '';
				}, 500);
			});
			
			// Create canvas
			const canvas = document.createElement('canvas');
			canvas.id = 'game-canvas';
			
			gameOverlay.appendChild(closeButton);
			gameOverlay.appendChild(canvas);
			document.body.appendChild(gameOverlay);
		}
		
		// Show game overlay with smooth transition
		gameOverlay.style.display = 'flex';
		// Lock page scroll
		document.body.style.overflow = 'hidden';
		
		// Fade out site content and fade in game
		mainLayout.style.transition = 'opacity 0.5s ease-in-out';
		mainLayout.style.opacity = '0';
		
		setTimeout(() => {
			gameOverlay.style.opacity = '1';
		}, 100);
		
		// Load game script if not already loaded
		if (!gameLoaded) {
			const gameScript = document.createElement('script');
			gameScript.src = '/js/game.bundle.js';
			gameScript.onload = function() {
				gameLoaded = true;
			};
			document.head.appendChild(gameScript);
		}
	});
});