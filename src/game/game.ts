// Extend window interface for TypeScript
declare global {
  interface Window {
    RPGGame: typeof RPGGame;
  }
}

interface Position {
  x: number;
  y: number;
}

interface Camera {
  x: number;
  y: number;
}

interface GameBox {
  position: Position;
  type: 'player' | 'interactive';
  contentUrl?: string;
  contentType?: 'video' | 'image' | 'markdown' | 'text';
  scoreChange?: number;
  tooltip?: string;
  viewed?: boolean;
}

class RPGGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridSize: number = 50;
  private mapWidth: number = 69;
  private mapHeight: number = 69;
  private player!: GameBox;
  private interactiveBoxes!: GameBox[];
  private mobileControls: HTMLDivElement | null = null;
  private camera!: Camera;
  private currentModalBox: GameBox | null = null;
  private mediaModal: any = null;
  private coordinatesDisplay: HTMLDivElement | null = null;
  private score: number = 69;
  private gameOver: boolean = false;
  private gameOverOverlay: HTMLDivElement | null = null;
  private animationTime: number = 0;
  private currentBackgroundX: number = 0;
  private currentBackgroundY: number = 0;
  private pointsNotifications: Array<{
    amount: number;
    x: number;
    y: number;
    startTime: number;
    duration: number;
  }> = [];
  private rainbowColors: string[] = [
    '#ff8888', '#ff9966', '#ffaa44', '#ffbb22', '#ffcc00', '#ddcc22', 
    '#bbcc44', '#99cc66', '#77cc88', '#55ccaa', '#33cccc', '#44aacc', 
    '#5588cc', '#6666cc', '#7744cc', '#8822cc', '#9900cc', '#aa2299', 
    '#bb4477', '#cc6655'
  ];

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Lock page scrolling when game is active
    this.lockPageScroll();
    
    // Get reference to the existing MediaModal instance with fallback
    this.mediaModal = (window as any).mediaModal;
    
    // If MediaModal isn't available yet, wait for it
    if (!this.mediaModal) {
      console.log('MediaModal not ready, waiting...');
      this.waitForMediaModal();
    } else {
      console.log('MediaModal found:', this.mediaModal);
    }
    
    this.setupCanvas();
    this.initializeGame().then(() => {
      this.setupEventListeners();
      this.setupMobileControls();
      this.setupCoordinatesDisplay();
      this.setupCleanupHandlers();
      this.gameLoop();
      this.showInstructionsModal();
    });
  }

  private waitForMediaModal(): void {
    const checkForModal = () => {
      this.mediaModal = (window as any).mediaModal;
      if (this.mediaModal) {
        console.log('MediaModal now available:', this.mediaModal);
      } else {
        setTimeout(checkForModal, 100);
      }
    };
    checkForModal();
  }

  private showInstructionsModal(): void {
    // Wait a bit for the game to fully load before showing instructions
    setTimeout(() => {
      if (this.mediaModal && typeof this.mediaModal.openInstructions === 'function') {
        this.mediaModal.openInstructions();
      } else {
        // If MediaModal isn't ready yet, wait for it
        const checkForModal = () => {
          this.mediaModal = (window as any).mediaModal;
          if (this.mediaModal && typeof this.mediaModal.openInstructions === 'function') {
            this.mediaModal.openInstructions();
          } else {
            setTimeout(checkForModal, 100);
          }
        };
        checkForModal();
      }
    }, 500);
  }

  private lockPageScroll(): void {
    // Prevent scrolling on the body element
    document.body.style.overflow = 'hidden';
    // Also prevent scrolling on the html element for better browser compatibility
    document.documentElement.style.overflow = 'hidden';
  }

  private unlockPageScroll(): void {
    // Restore scrolling
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  private setupCleanupHandlers(): void {
    // Unlock scroll when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.unlockPageScroll();
    });

    // Also unlock scroll on visibility change (when tab becomes hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.unlockPageScroll();
      } else {
        this.lockPageScroll();
      }
    });
  }

  private setupCanvas(): void {
    // Set canvas to full viewport size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Canvas styles are now handled by CSS
    
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      // Update camera position when canvas size changes
      if (this.camera) {
        this.updateCamera();
      }
    });
  }

  private async initializeGame(): Promise<void> {
    // Initialize player at world origin (0, 0)
    this.player = {
      position: { x: 0, y: 0 },
      type: 'player'
    };

    // Initialize camera to center player on screen in isometric space
    const playerIso = this.worldToIsometric(this.player.position);
    this.camera = {
      x: playerIso.x,
      y: playerIso.y
    };

    // Load interactive boxes from JSON file
    await this.loadGameData();
  }

  private async loadGameData(): Promise<void> {
    try {
      console.log('Loading game data from /src/game/content/game-data.json');
      const response = await fetch('/src/game/content/game-data.json');
      console.log('Response status:', response.status);
      const gameData = await response.json();
      console.log('Loaded game data:', gameData.length, 'boxes');
      
      // Convert grid positions to world positions and add any missing properties
      this.interactiveBoxes = gameData.map((box: any) => ({
        ...box,
        position: { 
          x: box.position.x * this.gridSize, 
          y: box.position.y * this.gridSize 
        },
        type: 'interactive' as const,
        contentUrl: box.contentUrl,
        contentType: box.contentType || 'video',
        viewed: box.viewed || false
      }));
      
      console.log('Processed interactive boxes:', this.interactiveBoxes.length);
      console.log('First few boxes:', this.interactiveBoxes.slice(0, 3));
    } catch (error) {
      console.error('Failed to load game data:', error);
      // Fallback to empty array if loading fails
      this.interactiveBoxes = [];
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0);
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (event) => {
      this.handleKeyPress(event.key);
    });
    
    // Listen for modal close events to reset currentModalBox
    document.addEventListener('modalClosed', () => {
      this.currentModalBox = null;
    });
  }

  private setupMobileControls(): void {
    if (!this.isMobileDevice()) return;

    this.mobileControls = document.createElement('div');
    this.mobileControls.id = 'mobile-controls';
    
    this.mobileControls.innerHTML = `
      <div class="dpad">
        <div></div>
        <button class="control-btn up" data-direction="up">↑</button>
        <div></div>
        <button class="control-btn left" data-direction="left">←</button>
        <div></div>
        <button class="control-btn right" data-direction="right">→</button>
        <div></div>
        <button class="control-btn down" data-direction="down">↓</button>
        <div></div>
      </div>
    `;

    // Append to the game overlay instead of body
    const gameOverlay = document.getElementById('gameOverlay');
    if (gameOverlay) {
      gameOverlay.appendChild(this.mobileControls);
    } else {
      document.body.appendChild(this.mobileControls);
    }

    const buttons = this.mobileControls.querySelectorAll('.control-btn');
    buttons.forEach(button => {
      const direction = button.getAttribute('data-direction');
      
      // Brief flash effect on interaction
      const flashButton = () => {
        button.classList.add('pressed');
        setTimeout(() => {
          button.classList.remove('pressed');
        }, 150);
      };
      
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleMobileInput(direction!);
        flashButton();
      });
      
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
      });
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleMobileInput(direction!);
        flashButton();
      });
    });
  }

  private setupCoordinatesDisplay(): void {
    this.coordinatesDisplay = document.createElement('div');
    this.coordinatesDisplay.id = 'coordinates-display';
    
    // Append to the game overlay instead of body
    const gameOverlay = document.getElementById('gameOverlay');
    if (gameOverlay) {
      gameOverlay.appendChild(this.coordinatesDisplay);
    } else {
      document.body.appendChild(this.coordinatesDisplay);
    }
    
    this.updateCoordinatesDisplay();
  }

  private showPointsNotification(amount: number): void {
    // Create DOM-based notification for better z-index control
    this.createDOMPointsNotification(amount);
    
    // Also add canvas-based notification as backup
    const playerScreenPos = this.worldToScreen(this.player.position);
    this.pointsNotifications.push({
      amount: amount,
      x: playerScreenPos.x,
      y: playerScreenPos.y,
      startTime: this.animationTime,
      duration: 180 // 3 seconds at 60fps
    });
  }

  private createDOMPointsNotification(amount: number): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'points-notification';
    
    // Format text
    const text = amount > 0 ? `+${amount}` : `${amount}`;
    notification.textContent = text;
    
    // Add positive/negative class for styling
    notification.classList.add(amount > 0 ? 'positive' : 'negative');
    
    // Get player position on screen
    const playerScreenPos = this.worldToScreen(this.player.position);
    
    // Position the notification
    notification.style.left = `${playerScreenPos.x}px`;
    notification.style.top = `${playerScreenPos.y - 30}px`;
    
    // Add to game overlay
    const gameOverlay = document.getElementById('gameOverlay');
    if (gameOverlay) {
      gameOverlay.appendChild(notification);
    } else {
      document.body.appendChild(notification);
    }
    
    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('animate');
    });
    
    // Remove after animation completes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  private showModalPointsNotification(amount: number): void {
    // Create notification element for modal overlay
    const notification = document.createElement('div');
    notification.className = 'modal-points-notification';
    
    // Format text
    const text = amount > 0 ? `+${amount}` : `${amount}`;
    notification.textContent = text;
    
    // Add positive/negative class for styling
    notification.classList.add(amount > 0 ? 'positive' : 'negative');
    
    // Position in center-top of screen
    notification.style.left = '50%';
    notification.style.top = '20%';
    
    // Add to body with highest z-index
    document.body.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('animate');
    });
    
    // Remove after animation completes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 4000); // Slightly longer duration for modal notifications
  }

  private updateScoreDisplay(): void {
    // Update coordinates display which now includes score
    this.updateCoordinatesDisplay();
    
    // Check for game over
    if (this.score <= 0 && !this.gameOver) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver(): void {
    this.gameOver = true;
    this.unlockPageScroll();
    this.showGameOverScreen();
  }

  private showGameOverScreen(): void {
    // Create game over overlay
    this.gameOverOverlay = document.createElement('div');
    this.gameOverOverlay.className = 'game-over-overlay';
    this.gameOverOverlay.textContent = 'YOU CRASHED OUT. RELOAD.';
    document.body.appendChild(this.gameOverOverlay);
  }

  private updateCoordinatesDisplay(): void {
    if (this.coordinatesDisplay) {
      const worldX = this.player.position.x / this.gridSize;
      const worldY = this.player.position.y / this.gridSize;
      this.coordinatesDisplay.textContent = `X: ${worldX}, Y: ${worldY} | Score: ${this.score}`;
    }
  }

  private isWithinBounds(position: Position): boolean {
    const gridX = position.x / this.gridSize;
    const gridY = position.y / this.gridSize;
    return gridX >= 0 && gridX < this.mapWidth && gridY >= 0 && gridY < this.mapHeight;
  }

  private handleMobileInput(direction: string): void {
    // Close instructions modal on any mobile movement input
    if (this.mediaModal && this.mediaModal.instructionsOpen) {
      this.mediaModal.close();
    }
    
    switch (direction) {
      case 'up':
        this.handleKeyPress('w');
        break;
      case 'down':
        this.handleKeyPress('s');
        break;
      case 'left':
        this.handleKeyPress('a');
        break;
      case 'right':
        this.handleKeyPress('d');
        break;
    }
  }

  private handleKeyPress(key: string): void {
    // Prevent movement if game is over
    if (this.gameOver) return;
    
    // Check if this is a movement key
    const isMovementKey = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'].includes(key.toLowerCase());
    
    // Close instructions modal on any movement input
    if (isMovementKey && this.mediaModal && this.mediaModal.instructionsOpen) {
      this.mediaModal.close();
    }
    
    const oldPosition = { ...this.player.position };
    let newPosition = { ...this.player.position };
    
    switch (key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        newPosition.y -= this.gridSize;
        break;
      case 'arrowdown':
      case 's':
        newPosition.y += this.gridSize;
        break;
      case 'arrowleft':
      case 'a':
        newPosition.x -= this.gridSize;
        break;
      case 'arrowright':
      case 'd':
        newPosition.x += this.gridSize;
        break;
    }

    // Only move if the new position is within bounds
    if (this.isWithinBounds(newPosition)) {
      this.player.position = newPosition;

      // Update camera to follow player
      this.updateCamera();

      // Update coordinates display
      this.updateCoordinatesDisplay();

      // Check for collisions with interactive boxes
      this.checkCollisions();
    }
  }

  private updateCamera(): void {
    // Center camera on player in isometric space
    const playerIso = this.worldToIsometric(this.player.position);
    this.camera.x = playerIso.x;
    this.camera.y = playerIso.y;
    
    // Update background position for parallax effect
    this.updateBackgroundPosition();
  }

  private updateBackgroundPosition(): void {
    const gameOverlay = document.getElementById('gameOverlay');
    if (gameOverlay) {
      // Calculate target parallax offset based on player position
      // Use an even smaller multiplier for very subtle effect
      const targetX = this.player.position.x * 0.05;
      const targetY = this.player.position.y * 0.05;
      
      // Smoothly interpolate towards target position
      const lerpFactor = 0.1; // Lower = smoother/slower, higher = more responsive
      this.currentBackgroundX += (targetX - this.currentBackgroundX) * lerpFactor;
      this.currentBackgroundY += (targetY - this.currentBackgroundY) * lerpFactor;
      
      // Update background position with smooth interpolated values
      gameOverlay.style.backgroundPosition = `${-this.currentBackgroundX}px ${-this.currentBackgroundY}px`;
    }
  }

  private checkCollisions(): void {
    let playerOnInteractiveBox = false;
    let currentBox: GameBox | null = null;
    
    for (const box of this.interactiveBoxes) {
      if (this.player.position.x === box.position.x && this.player.position.y === box.position.y) {
        playerOnInteractiveBox = true;
        currentBox = box;
        console.log('Player on interactive box:', { 
          position: box.position, 
          viewed: box.viewed, 
          tooltip: box.tooltip,
          currentModalBox: this.currentModalBox
        });
        
        // Only open modal if not already viewed and no modal is currently open
        if (!box.viewed && !this.currentModalBox) {
          console.log('Triggering modal open for box:', box.tooltip);
          this.openContentModal(box.contentUrl!, box.contentType || 'video', box);
        } else if (box.viewed) {
          console.log('Box already viewed, skipping modal');
        } else if (this.currentModalBox) {
          console.log('Modal already open, skipping');
        }
        break;
      }
    }
    
    // If player moved away from interactive box and modal is open, close it
    // Also close if the current modal box is different from the one player is on
    if (this.currentModalBox && (!playerOnInteractiveBox || (currentBox && currentBox !== this.currentModalBox))) {
      console.log('Player moved away from modal box, closing modal. PlayerOnBox:', playerOnInteractiveBox, 'CurrentBox:', currentBox?.tooltip, 'ModalBox:', this.currentModalBox?.tooltip);
      this.closeContentModal();
    }
  }

  private openContentModal(contentUrl: string, contentType: string, box: GameBox): void {
    console.log('Opening modal:', { contentUrl, contentType, tooltip: box.tooltip });
    
    // Store reference to the box that opened this modal
    this.currentModalBox = box;
    
    // Mark box as viewed
    box.viewed = true;
    
    // Apply score change when content is viewed
    if (box.scoreChange !== undefined) {
      this.score += box.scoreChange;
      this.showPointsNotification(box.scoreChange);
      this.showModalPointsNotification(box.scoreChange); // Show over modal
      this.updateScoreDisplay();
      console.log('Score updated:', this.score, 'change:', box.scoreChange);
    }
    
    // Try to get MediaModal if we don't have it
    if (!this.mediaModal) {
      this.mediaModal = (window as any).mediaModal;
    }
    
    // Use the existing MediaModal system or create a fallback
    if (this.mediaModal) {
      const title = box.tooltip || 'Game Content';
      console.log('Using MediaModal:', this.mediaModal, 'Title:', title);
      
      try {
        switch (contentType) {
          case 'video':
            console.log('Opening video modal');
            this.mediaModal.openVideo(contentUrl, title);
            break;
          case 'image':
            console.log('Opening image modal');
            this.mediaModal.openImage(contentUrl, title);
            break;
          case 'markdown':
            console.log('Opening markdown modal');
            this.mediaModal.openMarkdown(contentUrl, title);
            break;
          case 'text':
          default:
            console.log('Opening text modal');
            this.mediaModal.openText(contentUrl, title);
            break;
        }
      } catch (error) {
        console.error('Error opening modal:', error);
        this.createFallbackModal(contentUrl, contentType, box.tooltip || 'Game Content');
      }
    } else {
      console.error('MediaModal not available, using fallback');
      this.createFallbackModal(contentUrl, contentType, box.tooltip || 'Game Content');
    }
  }

  private createFallbackModal(contentUrl: string, contentType: string, title: string): void {
    console.log('Creating fallback modal');
    
    // Create a simple modal as fallback
    const modal = document.createElement('div');
    modal.className = 'game-fallback-modal';
    
    const container = document.createElement('div');
    container.className = 'modal-container';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'modal-close';
    
    const closeModal = () => {
      document.body.removeChild(modal);
      this.currentModalBox = null;
    };
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
    
    let content: HTMLElement;
    
    switch (contentType) {
      case 'video':
        content = document.createElement('iframe');
        (content as HTMLIFrameElement).src = contentUrl;
        (content as HTMLIFrameElement).width = '560';
        (content as HTMLIFrameElement).height = '315';
        break;
      case 'image':
        content = document.createElement('img');
        (content as HTMLImageElement).src = contentUrl;
        break;
      default:
        content = document.createElement('div');
        content.textContent = `Content: ${title}`;
        break;
    }
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.className = 'modal-title';
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'modal-content';
    contentWrapper.appendChild(content);
    
    container.appendChild(closeBtn);
    container.appendChild(titleElement);
    container.appendChild(contentWrapper);
    modal.appendChild(container);
    document.body.appendChild(modal);
  }

  private closeContentModal(): void {
    console.log('Closing modal');
    
    // Close the MediaModal if it exists and is open
    if (this.mediaModal) {
      try {
        if (this.mediaModal.isOpen) {
          this.mediaModal.close();
        } else if (typeof this.mediaModal.close === 'function') {
          // Try closing even if isOpen is not available or false
          this.mediaModal.close();
        }
      } catch (error) {
        console.log('Error closing MediaModal:', error);
      }
    }
    
    // Also check for any fallback modals and remove them
    const fallbackModals = document.querySelectorAll('[style*="z-index: 10002"]');
    fallbackModals.forEach(modal => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    });
    
    // Check for any other modal elements that might be open
    const otherModals = document.querySelectorAll('.media-modal.active, .modal.active');
    otherModals.forEach(modal => {
      modal.classList.remove('active');
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    });
    
    // Dispatch modal closed event for other systems that might be listening
    document.dispatchEvent(new CustomEvent('modalClosed'));
    
    this.currentModalBox = null;
  }


  private worldToIsometric(worldPos: Position): Position {
    const isoX = (worldPos.x - worldPos.y) * 0.866; // cos(30°) for diamond shape
    const isoY = (worldPos.x + worldPos.y) * 0.5;   // sin(30°) for height
    return { x: isoX, y: isoY };
  }

  private worldToScreen(worldPos: Position): Position {
    const isoPos = this.worldToIsometric(worldPos);
    return {
      x: isoPos.x - this.camera.x + this.canvas.width / 2,
      y: isoPos.y - this.camera.y + this.canvas.height / 2
    };
  }

  private isVisible(worldPos: Position, size: number = this.gridSize): boolean {
    const screenPos = this.worldToScreen(worldPos);
    const tileRadius = size * 0.5; // Approximate radius for isometric tile
    return screenPos.x + tileRadius >= 0 &&
           screenPos.x - tileRadius <= this.canvas.width &&
           screenPos.y + tileRadius >= 0 &&
           screenPos.y - tileRadius <= this.canvas.height;
  }

  private drawIsometricTile(screenPos: Position, size: number, fillStyle: string): void {
    const halfSize = size * 0.433; // Half width of isometric diamond
    const quarterHeight = size * 0.25;
    
    this.ctx.fillStyle = fillStyle;
    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x, screenPos.y - quarterHeight);
    this.ctx.lineTo(screenPos.x + halfSize, screenPos.y);
    this.ctx.lineTo(screenPos.x, screenPos.y + quarterHeight);
    this.ctx.lineTo(screenPos.x - halfSize, screenPos.y);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add outline for better visibility
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  private getRainbowColor(index: number, time: number): string {
    // Create cycling rainbow effect
    const colorIndex = (index + Math.floor(time * 0.02)) % this.rainbowColors.length;
    return this.rainbowColors[colorIndex];
  }

  private drawTooltip(screenPos: Position, text: string, time: number): void {
    // Calculate bounce animation
    const bounceOffset = Math.abs(Math.sin(time * 0.008)) * 9; // Bouncing animation (10% larger)
    const tooltipY = screenPos.y - 66 - bounceOffset; // Position higher above the tile (10% larger)
    
    // Set font properties - larger and more readable (10% increase)
    this.ctx.font = 'bold 20px "more", "Courier Prime", "Courier New", monospace';
    this.ctx.textAlign = 'center';
    
    // Measure text width for background
    const textWidth = this.ctx.measureText(text).width;
    const padding = 18; // Increased padding (10% larger)
    const bgWidth = textWidth + padding * 2;
    const bgHeight = 35; // Increased height (10% larger)
    
    // Draw tooltip background
    this.ctx.fillStyle = 'rgba(17, 17, 17, 0.95)';
    this.ctx.fillRect(screenPos.x - bgWidth / 2, tooltipY - bgHeight / 2, bgWidth, bgHeight);
    
    // Draw tooltip border with rainbow effect
    const rainbowColor = this.getRainbowColor(Math.floor(screenPos.x / 50), time);
    this.ctx.strokeStyle = rainbowColor;
    this.ctx.lineWidth = 3; // Thicker border
    this.ctx.strokeRect(screenPos.x - bgWidth / 2, tooltipY - bgHeight / 2, bgWidth, bgHeight);
    
    // Draw arrow pointing to the tile (upside down) - 10% larger
    this.ctx.fillStyle = 'rgba(17, 17, 17, 0.95)';
    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x, tooltipY + bgHeight / 2 + 13); // Point at bottom, larger arrow
    this.ctx.lineTo(screenPos.x - 9, tooltipY + bgHeight / 2); // Left point of arrow base (10% larger)
    this.ctx.lineTo(screenPos.x + 9, tooltipY + bgHeight / 2); // Right point of arrow base (10% larger)
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw border for arrow
    this.ctx.strokeStyle = rainbowColor;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // Draw tooltip text with white color for better readability
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(text, screenPos.x, tooltipY + 6);
    
    // Reset text align
    this.ctx.textAlign = 'left';
  }

  private drawPointsNotifications(): void {
    const currentTime = this.animationTime;
    
    // Remove expired notifications and draw active ones
    this.pointsNotifications = this.pointsNotifications.filter(notification => {
      const elapsed = currentTime - notification.startTime;
      const progress = elapsed / notification.duration;
      
      if (progress >= 1) {
        return false; // Remove expired notification
      }
      
      // Calculate animation properties
      const easeOut = 1 - Math.pow(1 - progress, 3); // Smooth ease-out curve
      const floatUp = easeOut * 80; // Float up 80 pixels
      const fadeOut = Math.max(0, 1 - (progress * 2)); // Start fading at 50%
      const scale = Math.min(1, progress * 4); // Quick scale-in at start
      
      // Calculate position
      const y = notification.y - floatUp;
      const x = notification.x;
      
      // Set font and styles
      this.ctx.save();
      this.ctx.globalAlpha = fadeOut;
      this.ctx.font = `bold ${Math.floor(28 * scale)}px "more", "Courier Prime", "Courier New", monospace`;
      this.ctx.textAlign = 'center';
      
      // Format text
      const text = notification.amount > 0 ? `+${notification.amount}` : `${notification.amount}`;
      
      // Choose colors based on positive/negative
      const isPositive = notification.amount > 0;
      const textColor = isPositive ? '#27ae60' : '#e74c3c'; // Green for positive, red for negative
      const glowColor = isPositive ? '#2ecc71' : '#c0392b';
      
      // Draw glow effect
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 8;
      this.ctx.fillStyle = textColor;
      this.ctx.fillText(text, x, y);
      
      // Draw main text (slightly offset for depth)
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = textColor;
      this.ctx.lineWidth = 2;
      this.ctx.strokeText(text, x, y);
      this.ctx.fillText(text, x, y);
      
      this.ctx.restore();
      
      return true; // Keep notification
    });
  }

  private drawScoreChange(screenPos: Position, scoreChange: number): void {
    // Set font properties (10% larger)
    this.ctx.font = 'bold 15px "more", "Courier Prime", "Courier New", monospace';
    this.ctx.textAlign = 'center';
    
    // Format score text
    const scoreText = scoreChange > 0 ? `+${scoreChange}` : `${scoreChange}`;
    
    // Choose color based on positive/negative
    this.ctx.fillStyle = scoreChange > 0 ? '#ffffff' : '#ffffff';
    
    // Add text shadow for better visibility
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 3;
    this.ctx.shadowOffsetX = 1;
    this.ctx.shadowOffsetY = 1;
    
    // Draw score text in center of tile
    this.ctx.fillText(scoreText, screenPos.x, screenPos.y + 5);
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Reset text align
    this.ctx.textAlign = 'left';
  }

  private drawMapBoundaries(): void {
    this.ctx.strokeStyle = '#33cccc'; // Cyan color for boundaries
    this.ctx.lineWidth = 3;
    
    const corners = [
      { x: 0, y: 0 }, // Top-left
      { x: (this.mapWidth - 1) * this.gridSize, y: 0 }, // Top-right
      { x: (this.mapWidth - 1) * this.gridSize, y: (this.mapHeight - 1) * this.gridSize }, // Bottom-right
      { x: 0, y: (this.mapHeight - 1) * this.gridSize } // Bottom-left
    ];
    
    // Convert corners to screen positions
    const screenCorners = corners.map(corner => this.worldToScreen(corner));
    
    // Draw boundary lines
    this.ctx.beginPath();
    this.ctx.moveTo(screenCorners[0].x, screenCorners[0].y);
    for (let i = 1; i < screenCorners.length; i++) {
      this.ctx.lineTo(screenCorners[i].x, screenCorners[i].y);
    }
    this.ctx.closePath();
    this.ctx.stroke();
  }

  private drawStarfield(): void {
    // Clear canvas with transparent background
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Don't draw the starfield - let the body background show through
    // The game now has a transparent background
  }

  private draw(): void {
    // Draw starfield background
    this.drawStarfield();

    // Draw grid
    this.drawGrid();

    // Draw map boundaries
    this.drawMapBoundaries();

    // Draw interactive boxes - only if visible
    for (let i = 0; i < this.interactiveBoxes.length; i++) {
      const box = this.interactiveBoxes[i];
      if (this.isVisible(box.position)) {
        const screenPos = this.worldToScreen(box.position);
        
        // Choose color based on viewed status
        let tileColor: string;
        if (box.viewed) {
          // Use consistent colors for viewed boxes based on score
          tileColor = (box.scoreChange && box.scoreChange > 0) ? '#27ae60' : '#e74c3c'; // Green for positive, red for negative
        } else {
          // Use rainbow colors for unviewed boxes
          tileColor = this.getRainbowColor(i, this.animationTime);
        }
        
        this.drawIsometricTile(screenPos, this.gridSize, tileColor);
        
        // Draw score change number for viewed boxes
        if (box.viewed && box.scoreChange !== undefined) {
          this.drawScoreChange(screenPos, box.scoreChange);
        }
        
        // Draw tooltip for unviewed boxes only
        if (!box.viewed && box.tooltip) {
          this.drawTooltip(screenPos, box.tooltip, this.animationTime);
        }
      }
    }

    // Draw player (red) - always visible as camera follows player
    const playerScreenPos = this.worldToScreen(this.player.position);
    this.drawIsometricTile(playerScreenPos, this.gridSize, '#e74c3c');

    // Draw floating points notifications
    this.drawPointsNotifications();
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#111111';
    this.ctx.lineWidth = 1;

    // Draw grid lines within map boundaries only
    // Draw vertical grid lines (running along X axis)
    for (let x = 0; x <= this.mapWidth; x++) {
      const startWorldPos = { x: x * this.gridSize, y: 0 };
      const endWorldPos = { x: x * this.gridSize, y: this.mapHeight * this.gridSize };
      
      const startScreen = this.worldToScreen(startWorldPos);
      const endScreen = this.worldToScreen(endWorldPos);
      
      this.ctx.beginPath();
      this.ctx.moveTo(startScreen.x, startScreen.y);
      this.ctx.lineTo(endScreen.x, endScreen.y);
      this.ctx.stroke();
    }
    
    // Draw horizontal grid lines (running along Y axis)
    for (let y = 0; y <= this.mapHeight; y++) {
      const startWorldPos = { x: 0, y: y * this.gridSize };
      const endWorldPos = { x: this.mapWidth * this.gridSize, y: y * this.gridSize };
      
      const startScreen = this.worldToScreen(startWorldPos);
      const endScreen = this.worldToScreen(endWorldPos);
      
      this.ctx.beginPath();
      this.ctx.moveTo(startScreen.x, startScreen.y);
      this.ctx.lineTo(endScreen.x, endScreen.y);
      this.ctx.stroke();
    }
  }

  private gameLoop(): void {
    // Update animation time
    this.animationTime++;
    
    // Update background position every frame for smooth parallax
    this.updateBackgroundPosition();
    
    // Only draw game if not game over
    if (!this.gameOver) {
      this.draw();
    }
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Initialize game immediately when script loads (since it's loaded dynamically)
// Also expose the game class globally for manual initialization
window.RPGGame = RPGGame;

// Try to initialize immediately, or wait for DOM if not ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RPGGame();
  });
} else {
  // DOM is already loaded, initialize immediately
  new RPGGame();
}

// {
//   "position": { "x": 1, "y": 1 },
//   "type": "interactive",
//   "contentUrl": "https://picsum.photos/800/600?random=1",
//   "contentType": "image",
//   "scoreChange": 5,
//   "tooltip": "Random Nature Photo",
//   "viewed": false
// },
// {
//   "position": { "x": 2, "y": 1 },
//   "type": "interactive",
//   "contentUrl": "https://picsum.photos/800/600?random=2",
//   "contentType": "image",
//   "scoreChange": -3,
//   "tooltip": "Abstract Art",
//   "viewed": false
// },
// {
//   "position": { "x": 3, "y": 1 },
//   "type": "interactive",
//   "contentUrl": "/src/game/content/sample-guide.md",
//   "contentType": "markdown",
//   "scoreChange": 8,
//   "tooltip": "Game Development Guide",
//   "viewed": false
// },
// {
//   "position": { "x": 1, "y": 2 },
//   "type": "interactive",
//   "contentUrl": "https://raw.githubusercontent.com/torvalds/linux/master/README",
//   "contentType": "text",
//   "scoreChange": 12,
//   "tooltip": "Linux Kernel README",
//   "viewed": false
// },
// {
//   "position": { "x": 2, "y": 2 },
//   "type": "interactive",
//   "contentUrl": "https://picsum.photos/800/600?random=3",
//   "contentType": "image",
//   "scoreChange": -2,
//   "tooltip": "Landscape Photo",
//   "viewed": false
// },
// {
//   "position": { "x": 3, "y": 2 },
//   "type": "interactive",
//   "contentUrl": "/src/game/content/tech-overview.md",
//   "contentType": "markdown",
//   "scoreChange": 10,
//   "tooltip": "Technical Overview",
//   "viewed": false
// },
// {
//   "position": { "x": 1, "y": 3 },
//   "type": "interactive",
//   "contentUrl": "https://www.gutenberg.org/files/74/74-0.txt",
//   "contentType": "text",
//   "scoreChange": 15,
//   "tooltip": "Adventures of Tom Sawyer",
//   "viewed": false
// },
// {
//   "position": { "x": 2, "y": 3 },
//   "type": "interactive",
//   "contentUrl": "https://picsum.photos/800/600?random=4",
//   "contentType": "image",
//   "scoreChange": 7,
//   "tooltip": "Urban Architecture",
//   "viewed": false
// },
// {
//   "position": { "x": 3, "y": 3 },
//   "type": "interactive",
//   "contentUrl": "/src/game/content/markdown-features.md",
//   "contentType": "markdown",
//   "scoreChange": 12,
//   "tooltip": "Markdown Features Demo",
//   "viewed": false
// },