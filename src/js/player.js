import MediaModal from './modal.js';
import { Howl } from 'howler';

class AlbumPlayer {
	constructor(tracks) {
		this.tracks = tracks;
		this.currentTrack = 0;
		this.isPlaying = false;
		this.sound = null;
		this.volume = 1.0;
		
		this.playButton = document.getElementById('playButton');
		this.prevButton = document.getElementById('prevButton');
		this.nextButton = document.getElementById('nextButton');
		this.progressBar = document.getElementById('progressBar');
		this.progressFill = document.getElementById('progressFill');
		this.timeDisplay = document.getElementById('timeDisplay');
		this.lyricsContainer = document.getElementById('lyricsContainer');
		this.lyricsContent = document.getElementById('lyricsContent');
		this.lyricsText = document.getElementById('lyricsText');
		this.lyricsTitle = document.getElementById('lyricsTitle');
		this.currentTrackTitle = document.getElementById('currentTrackTitle');
		this.currentTrackArtist = document.getElementById('currentTrackArtist');
		
		this.initializePlayer();
		this.bindEvents();
	}
	
	initializePlayer() {
		this.loadTrack(this.currentTrack);
		this.updateLyrics();
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
		this.playButton.textContent = '⏸';
		this.updateProgress();
	}
	
	pause() {
		if (!this.sound) return;
		
		this.sound.pause();
		this.isPlaying = false;
		this.playButton.textContent = '▶';
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
	
	prevTrack() {
		this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
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
		
		this.updateCurrentlyPlaying();
		this.updateLyrics();
	}
	
	updateCurrentlyPlaying() {
		const currentTrack = this.tracks[this.currentTrack];
		if (currentTrack) {
			this.currentTrackTitle.textContent = currentTrack.title;
		} else {
			this.currentTrackTitle.textContent = 'Select a track to play';
		}
	}
	
	updateLyrics() {
		const currentTrack = this.tracks[this.currentTrack];
		if (currentTrack) {
			this.lyricsTitle.textContent = `Lyrics - ${currentTrack.title}`;
			this.lyricsContainer.style.display = 'block';
			
			// Hide all lyrics
			document.querySelectorAll('.lyrics-text').forEach(lyricsEl => {
				lyricsEl.classList.add('hidden');
			});
			
			// Show current track's lyrics
			const currentLyricsEl = document.getElementById(`lyricsText-${currentTrack.id}`);
			if (currentLyricsEl) {
				currentLyricsEl.classList.remove('hidden');
			}
		} else {
			this.lyricsContainer.style.display = 'block';
		}
	}
	
	
	
	
	formatTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
	
	bindEvents() {
		this.playButton.addEventListener('click', () => this.togglePlay());
		this.prevButton.addEventListener('click', () => this.prevTrack());
		this.nextButton.addEventListener('click', () => this.nextTrack());
		
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
	
	// Initialize the modal component
	new MediaModal();
});