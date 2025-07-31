let gameLoaded = false;
let gameOverlay = null;

const createGameOverlay = () => {
  gameOverlay = document.createElement('div');
  gameOverlay.id = 'gameOverlay';
  
  const closeButton = document.createElement('button');
  closeButton.id = 'gameCloseButton';
  closeButton.textContent = '×';
  
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  
  gameOverlay.appendChild(closeButton);
  gameOverlay.appendChild(canvas);
  document.body.appendChild(gameOverlay);
  
  return closeButton;
};

const hideGameOverlay = (mainLayout) => {
  gameOverlay.style.opacity = '0';
  mainLayout.style.opacity = '1';
  
  setTimeout(() => {
    gameOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }, 500);
};

const showGameOverlay = (mainLayout) => {
  gameOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  mainLayout.style.transition = 'opacity 0.5s ease-in-out';
  mainLayout.style.opacity = '0';
  
  setTimeout(() => {
    gameOverlay.style.opacity = '1';
  }, 100);
};

const loadGameScript = () => {
  if (!gameLoaded) {
    const gameScript = document.createElement('script');
    gameScript.src = '/js/game.bundle.js';
    gameScript.onload = () => gameLoaded = true;
    document.head.appendChild(gameScript);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const gameButton = document.getElementById('gameButton');
  const mainLayout = document.querySelector('.main-layout');
  
  gameButton.addEventListener('click', () => {
    if (!gameOverlay) {
      const closeButton = createGameOverlay();
      closeButton.addEventListener('click', () => hideGameOverlay(mainLayout));
    }
    
    showGameOverlay(mainLayout);
    loadGameScript();
  });
});
