class UnlockSystem {
    constructor() {
        this.isUnlocked = localStorage.getItem('tracksUnlocked') === 'true';
        this.init();
        this.updateUIState();
        
        // If already unlocked on page load, show all tracks
        if (this.isUnlocked) {
            setTimeout(() => this.showAllTracks(), 100);
        }
    }

    init() {
        const unlockButton = document.getElementById('unlockButton');
        const unlockModal = document.getElementById('unlockModal');
        const unlockModalClose = document.getElementById('unlockModalClose');
        const unlockSubmit = document.getElementById('unlockSubmit');
        const unlockCancel = document.getElementById('unlockCancel');
        const unlockInput = document.getElementById('unlockInput');
        const unlockError = document.getElementById('unlockError');

        if (!unlockButton || !unlockModal) return;

        // Open modal
        unlockButton.addEventListener('click', () => {
            if (this.isUnlocked) {
                this.lockTracks();
            } else {
                this.openModal();
            }
        });

        // Close modal
        unlockModalClose.addEventListener('click', () => this.closeModal());
        unlockCancel.addEventListener('click', () => this.closeModal());

        // Click outside modal to close
        unlockModal.addEventListener('click', (e) => {
            if (e.target === unlockModal) {
                this.closeModal();
            }
        });

        // Submit unlock code
        unlockSubmit.addEventListener('click', () => this.submitUnlockCode());
        
        // Enter key in input
        unlockInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitUnlockCode();
            }
        });

        // Clear error when typing
        unlockInput.addEventListener('input', () => {
            unlockError.classList.add('hidden');
        });
    }

    openModal() {
        const modal = document.getElementById('unlockModal');
        const input = document.getElementById('unlockInput');
        modal.classList.add('active');
        setTimeout(() => input.focus(), 100);
    }

    closeModal() {
        const modal = document.getElementById('unlockModal');
        const input = document.getElementById('unlockInput');
        const error = document.getElementById('unlockError');
        
        modal.classList.remove('active');
        input.value = '';
        error.classList.add('hidden');
    }

    async submitUnlockCode() {
        const input = document.getElementById('unlockInput');
        const error = document.getElementById('unlockError');
        const code = input.value.trim();

        if (!code) {
            this.showError('Please enter an unlock code');
            return;
        }

        try {
            const response = await fetch('/api/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code })
            });

            const result = await response.json();

            if (result.success) {
                this.unlockTracks();
                this.closeModal();
            } else {
                this.showError('Invalid unlock code. Please try again.');
            }
        } catch (error) {
            console.error('Unlock request failed:', error);
            this.showError('Connection error. Please try again.');
        }
    }

    showError(message) {
        const error = document.getElementById('unlockError');
        error.textContent = message;
        error.classList.remove('hidden');
    }

    unlockTracks() {
        console.log('🔓 UNLOCKING ALL TRACKS');
        this.isUnlocked = true;
        localStorage.setItem('tracksUnlocked', 'true');
        this.updateUIState();
        this.showAllTracks();
        
        // Show success message
        setTimeout(() => {
            alert('🎉 All tracks unlocked! You can now play any song.');
        }, 100);
    }

    lockTracks() {
        console.log('🔐 LOCKING TRACKS');
        this.isUnlocked = false;
        localStorage.removeItem('tracksUnlocked');
        this.updateUIState();
        this.hideLockedTracks();
        
        // Show lock message
        setTimeout(() => {
            alert('🔐 Tracks locked. Some songs are now restricted.');
        }, 100);
    }

    updateUIState() {
        const unlockButton = document.getElementById('unlockButton');
        if (unlockButton) {
            unlockButton.textContent = this.isUnlocked ? '🔓' : '🔐';
            unlockButton.title = this.isUnlocked ? 'Lock tracks' : 'Unlock all tracks';
        }
    }

    showAllTracks() {
        console.log('🔓 Showing all tracks...');
        
        // Get all track elements
        const allTracks = document.querySelectorAll('.track');
        console.log('Found tracks:', allTracks.length);
        
        allTracks.forEach(track => {
            const trackId = track.dataset.trackId;
            const originalTitle = track.dataset.originalTitle;
            const wasOriginallyEnabled = track.dataset.originallyEnabled !== 'false';
            
            console.log(`Track ${trackId}: originalTitle="${originalTitle}", wasEnabled=${wasOriginallyEnabled}`);
            
            // Remove disabled styling and make clickable
            track.classList.remove('track--disabled');
            track.style.cursor = 'pointer';
            track.setAttribute('data-has-override', 'false');
            
            // Update title to original
            const titleElement = track.querySelector('.track__title');
            if (titleElement && originalTitle) {
                console.log(`Changing title from "${titleElement.textContent}" to "${originalTitle}"`);
                titleElement.textContent = originalTitle;
            }
            
            // Update global track data if available
            if (window.albumData && window.albumData.tracks) {
                const trackData = window.albumData.tracks.find(t => t.id == trackId);
                if (trackData) {
                    console.log(`Setting track ${trackId} enabled: ${trackData.enabled} → true`);
                    trackData.enabled = true;
                }
            }
            
            // Also update player's internal track data if available
            if (window.player && window.player.tracks) {
                const playerTrackData = window.player.tracks.find(t => t.id == trackId);
                if (playerTrackData) {
                    console.log(`Setting player track ${trackId} enabled: ${playerTrackData.enabled} → true`);
                    playerTrackData.enabled = true;
                }
            }
        });

        // Update player if available
        if (window.player && window.player.updateTrackList) {
            window.player.updateTrackList();
        }
        
        console.log('✅ All tracks are now unlocked and clickable!');
    }

    hideLockedTracks() {
        console.log('🔐 Hiding locked tracks...');
        
        // Get all track elements
        const allTracks = document.querySelectorAll('.track');
        
        allTracks.forEach(track => {
            const trackId = track.dataset.trackId;
            const originalTitle = track.dataset.originalTitle;
            const overrideText = track.dataset.overrideText;
            const wasOriginallyEnabled = track.dataset.originallyEnabled !== 'false';
            
            // Only lock tracks that were originally disabled
            if (!wasOriginallyEnabled) {
                console.log(`Locking track ${trackId}`);
                
                // Restore disabled styling
                track.classList.add('track--disabled');
                track.style.cursor = 'not-allowed';
                track.setAttribute('data-has-override', overrideText ? 'true' : 'false');
                
                // Restore override text or original title
                const titleElement = track.querySelector('.track__title');
                if (titleElement) {
                    const displayText = overrideText || originalTitle;
                    console.log(`Restoring title to "${displayText}"`);
                    titleElement.textContent = displayText;
                }
                
                // Update global track data if available
                if (window.albumData && window.albumData.tracks) {
                    const trackData = window.albumData.tracks.find(t => t.id == trackId);
                    if (trackData) {
                        trackData.enabled = false;
                    }
                }
            }
        });

        // Update player if available
        if (window.player && window.player.updateTrackList) {
            window.player.updateTrackList();
        }
        
        console.log('✅ Tracks have been locked!');
    }
}

// Initialize unlock system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Initializing unlock system...');
    window.unlockSystem = new UnlockSystem();
});