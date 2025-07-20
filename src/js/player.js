import MediaModal from './modal.js';
import { Howl } from 'howler';

class AlbumPlayer {
  constructor(tracks, albumData) {
    this.tracks = tracks;
    this.albumData = albumData;
    this.currentTrack = -1;
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
    this.updateCurrentlyPlaying();
    this.showDefaultLyrics();
    this.updateButtonStates();
    this.updatePlayButtonAnimation();
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
    this.playButton.textContent = 'PAUSE';
    this.updatePlayButtonAnimation();
    this.updateLyrics();
    this.updateProgress();
  }
  
  pause() {
    if (!this.sound) return;
    
    this.sound.pause();
    this.isPlaying = false;
    this.playButton.textContent = 'PLAY';
    this.updatePlayButtonAnimation();
  }
  
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.currentTrack < 0) {
        this.currentTrack = 0;
        this.loadTrack(this.currentTrack);
      }
      this.play();
    }
  }
  
  nextTrack() {
    if (this.currentTrack < 0) {
      this.currentTrack = 0;
    } else {
      this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    }
    this.loadTrack(this.currentTrack);
    if (this.isPlaying) {
      this.play();
    }
  }
  
  prevTrack() {
    if (this.currentTrack < 0) {
      this.currentTrack = this.tracks.length - 1;
    } else {
      this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    }
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
      this.progressFill.style.width = `${progress}%`;
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
    this.updateButtonStates();
  }
  
  updateCurrentlyPlaying() {
    const currentTrack = this.tracks[this.currentTrack];
    if (currentTrack && this.currentTrack >= 0) {
      this.currentTrackTitle.textContent = currentTrack.title;
      document.title = `${currentTrack.title} - ${this.albumData.title}`;
    } else {
      this.currentTrackTitle.textContent = 'Select a track to play';
      document.title = `${this.albumData.title} - ${this.albumData.artist}`;
    }
  }
  
  updateButtonStates() {
    if (this.currentTrack < 0) {
      this.prevButton.classList.add('disabled');
      this.nextButton.classList.add('disabled');
    } else {
      this.prevButton.classList.remove('disabled');
      this.nextButton.classList.remove('disabled');
    }
  }
  
  updatePlayButtonAnimation() {
    if (this.isPlaying) {
      this.playButton.classList.remove('animate');
    } else {
      this.playButton.classList.add('animate');
    }
  }
  
  updateLyrics() {
    const currentTrack = this.tracks[this.currentTrack];
    if (currentTrack) {
      this.lyricsTitle.textContent = `Lyrics - ${currentTrack.title}`;
      this.lyricsContainer.style.display = 'block';
      
      // Hide all lyrics including default state
      document.querySelectorAll('.lyrics__text').forEach(lyricsEl => {
        lyricsEl.classList.add('hidden');
      });
      
      // Show only the current track's lyrics
      const currentLyricsEl = document.getElementById(`lyricsText-${currentTrack.id}`);
      if (currentLyricsEl) {
        currentLyricsEl.classList.remove('hidden');
      }
    } else {
      this.lyricsTitle.textContent = 'Lyrics';
      this.lyricsContainer.style.display = 'block';
      
      // Hide all track lyrics and show default state
      document.querySelectorAll('.lyrics__text').forEach(lyricsEl => {
        lyricsEl.classList.add('hidden');
      });
      
      const defaultLyricsEl = document.getElementById('lyricsText-default');
      if (defaultLyricsEl) {
        defaultLyricsEl.classList.remove('hidden');
      }
    }
  }

  showDefaultLyrics() {
    this.lyricsTitle.textContent = 'Welcome!';
    this.lyricsContainer.style.display = 'block';
    
    // Hide all track lyrics and show default state
    document.querySelectorAll('.lyrics__text').forEach(lyricsEl => {
      lyricsEl.classList.add('hidden');
    });
    
    const defaultLyricsEl = document.getElementById('lyricsText-default');
    if (defaultLyricsEl) {
      defaultLyricsEl.classList.remove('hidden');
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
		new AlbumPlayer(albumData.tracks, albumData);
	}
	
	// Initialize the modal component
	new MediaModal();
});