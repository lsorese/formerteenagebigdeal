class AlbumPlayer {
	constructor(tracks) {
		this.tracks = tracks;
		this.currentTrack = 0;
		this.isPlaying = false;
		this.sound = null;
		this.volume = 1.0;
		
		this.playButton = document.getElementById('playButton');
		this.progressBar = document.getElementById('progressBar');
		this.progressFill = document.getElementById('progressFill');
		this.timeDisplay = document.getElementById('timeDisplay');
		
		this.initializePlayer();
		this.bindEvents();
	}
	
	initializePlayer() {
		this.loadTrack(this.currentTrack);
	}
	
	loadTrack(index) {
		if (this.sound) {
			this.sound.stop();
			this.sound.unload();
		}
		
		const track = this.tracks[index];
		this.sound = new Howl({
			src: [track.url],
			html5: true,
			volume: this.volume,
			onend: () => this.nextTrack()
		});
		
		this.updateTrackDisplay();
	}
	
	play() {
		if (!this.sound) return;
		
		this.sound.play();
		this.isPlaying = true;
		this.playButton.textContent = '⏸ Pause';
		this.updateProgress();
	}
	
	pause() {
		if (!this.sound) return;
		
		this.sound.pause();
		this.isPlaying = false;
		this.playButton.textContent = '▶ Play';
	}
	
	togglePlay() {
		if (this.isPlaying) {
			this.pause();
		} else {
			this.play();
		}
	}
	
	nextTrack() {
		this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
		this.loadTrack(this.currentTrack);
		if (this.isPlaying) {
			this.play();
		}
	}
	
	selectTrack(index) {
		this.currentTrack = index;
		this.loadTrack(index);
		this.play();
	}
	
	updateProgress() {
		if (!this.sound || !this.isPlaying) return;
		
		const seek = this.sound.seek() || 0;
		const duration = this.sound.duration() || 0;
		
		if (duration > 0) {
			const progress = (seek / duration) * 100;
			this.progressFill.style.width = progress + '%';
			this.timeDisplay.textContent = this.formatTime(seek);
		}
		
		if (this.isPlaying) {
			requestAnimationFrame(() => this.updateProgress());
		}
	}
	
	updateTrackDisplay() {
		document.querySelectorAll('.track').forEach(track => {
			track.classList.remove('playing');
		});
		
		const currentTrackElement = document.querySelector(`[data-track-id="${this.currentTrack + 1}"]`);
		if (currentTrackElement) {
			currentTrackElement.classList.add('playing');
		}
	}
	
	
	
	formatTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
	
	bindEvents() {
		this.playButton.addEventListener('click', () => this.togglePlay());
		
		this.progressBar.addEventListener('click', (e) => {
			if (!this.sound) return;
			
			const rect = this.progressBar.getBoundingClientRect();
			const percent = (e.clientX - rect.left) / rect.width;
			const duration = this.sound.duration();
			
			if (duration > 0) {
				this.sound.seek(duration * percent);
			}
		});
		
		
		document.querySelectorAll('.track').forEach((track, index) => {
			track.addEventListener('click', () => this.selectTrack(index));
		});
	}
}

// Initialize the player when the page loads
document.addEventListener('DOMContentLoaded', () => {
	const albumData = window.albumData;
	if (albumData && albumData.tracks) {
		new AlbumPlayer(albumData.tracks);
	}
});