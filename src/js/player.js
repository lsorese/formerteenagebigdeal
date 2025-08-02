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
    this.wasPlayingBeforeModal = false;
    
    this.playButton = document.getElementById('playButton');
    this.prevButton = document.getElementById('prevButton');
    this.nextButton = document.getElementById('nextButton');
    this.downloadButton = document.getElementById('downloadButton');
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
    const baseUrl = track.url.replace('/mp3/', '');
    const formats = [
      `/webm/${baseUrl}.webm`,
      `/aac/${baseUrl}.aac`,
      `/mp3/${baseUrl}.mp3`
    ];
    
    // Show loading state
    this.setLoadingState(true);
    
    this.sound = new Howl({
      src: formats,
      html5: false,
      volume: this.volume,
      onend: () => this.nextTrack(),
      onload: () => {
        this.setLoadingState(false);
      },
      onloaderror: () => {
        this.setLoadingState(false);
      }
    });
    
    if (track?.color) {
      this.progressFill.style.boxShadow = `inset 0 0 10px ${track.color}`;
    }
    
    this.updateTrackDisplay();
  }
  
  play() {
    if (!this.sound) return;
    
    // Clear loading state when starting to play
    this.setLoadingState(false);
    
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
    this.pauseAllVideos();
    this.currentTrack = this.currentTrack < 0 
      ? 0 
      : (this.currentTrack + 1) % this.tracks.length;
    this.loadTrack(this.currentTrack);
    if (this.isPlaying) this.play();
  }
  
  prevTrack() {
    this.pauseAllVideos();
    this.currentTrack = this.currentTrack < 0 
      ? this.tracks.length - 1 
      : (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    this.loadTrack(this.currentTrack);
    if (this.isPlaying) this.play();
  }
  
  selectTrack(index) {
    this.pauseAllVideos();
    this.currentTrack = index;
    this.loadTrack(index);
    this.play();
  }
  
  showDownloadOptions() {
    if (this.isPlaying) this.pause();
    this.showDefaultLyrics();
    
    document.getElementById('lyricsContainer')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
  
  updateProgress() {
    if (!this.sound || !this.isPlaying) return;
    
    const seek = this.sound.seek() || 0;
    const duration = this.sound.duration() || 0;
    
    if (duration > 0) {
      const progress = (seek / duration) * 100;
      this.progressFill.style.width = `${progress}%`;
      
      // Only update time display if not in loading state
      if (!this.timeDisplay.classList.contains('loading')) {
        this.timeDisplay.textContent = this.formatTime(seek);
      }
      
      const currentTrack = this.tracks[this.currentTrack];
      if (currentTrack?.color && !this.progressFill.classList.contains('loading')) {
        this.progressFill.style.boxShadow = `inset 0 0 10px ${currentTrack.color}`;
      }
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
      this.currentTrackTitle.textContent = 'Select a track or press play';
      document.title = `${this.albumData.title} - ${this.albumData.artist}`;
    }
  }
  
  updateButtonStates() {
    const disabled = this.currentTrack < 0;
    this.prevButton.classList.toggle('disabled', disabled);
    this.nextButton.classList.toggle('disabled', disabled);
  }
  
  updatePlayButtonAnimation() {
    this.playButton.classList.toggle('animate', !this.isPlaying);
  }
  
  updateLyrics() {
    const currentTrack = this.tracks[this.currentTrack];
    if (currentTrack) {
      this.lyricsTitle.textContent = `Lyrics - ${currentTrack.title}`;
      this.lyricsContainer.style.display = 'block';
      
      document.querySelectorAll('.lyrics__text').forEach(lyricsEl => {
        lyricsEl.classList.add('hidden');
      });
      
      const currentLyricsEl = document.getElementById(`lyricsText-${currentTrack.id}`);
      if (currentLyricsEl) {
        currentLyricsEl.classList.remove('hidden');
        this.applyTrackColorToLinks(currentTrack);
      }
    } else {
      this.lyricsTitle.textContent = 'Lyrics';
      this.lyricsContainer.style.display = 'block';
      
      document.querySelectorAll('.lyrics__text').forEach(lyricsEl => {
        lyricsEl.classList.add('hidden');
      });
      
      const defaultLyricsEl = document.getElementById('lyricsText-default');
      defaultLyricsEl?.classList.remove('hidden');
    }
  }

  showDefaultLyrics() {
    this.lyricsTitle.textContent = 'Welcome!';
    this.lyricsContainer.style.display = 'block';
    
    document.querySelectorAll('.lyrics__text').forEach(lyricsEl => {
      lyricsEl.classList.add('hidden');
    });
    
    const defaultLyricsEl = document.getElementById('lyricsText-default');
    defaultLyricsEl?.classList.remove('hidden');
  }
  
  applyTrackColorToLinks(track) {
    const currentLyricsEl = document.getElementById(`lyricsText-${track.id}`);
    if (currentLyricsEl && track.color) {
      const links = currentLyricsEl.querySelectorAll('a');
      links.forEach(link => {
        link.style.color = track.color;
        link.style.setProperty('--hover-color', track.color);
      });
    }
  }
  
  setLoadingState(isLoading) {
    if (isLoading) {
      this.progressFill.classList.add('loading');
      this.timeDisplay.classList.add('loading');
      this.timeDisplay.textContent = 'Loading';
    } else {
      this.progressFill.classList.remove('loading');
      this.timeDisplay.classList.remove('loading');
      this.timeDisplay.textContent = '0:00';
    }
  }
  
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  pauseAllVideos() {
    document.querySelectorAll('.youtube-embed-container iframe').forEach(iframe => {
      if (iframe.src) {
        iframe.src = '';
        
        const container = iframe.closest('.youtube-embed-container');
        const toggle = container?.parentElement?.querySelector('.youtube-toggle');
        const arrow = toggle?.querySelector('.youtube-toggle-arrow');
        const text = toggle?.querySelector('.youtube-toggle-text');
        
        if (container && !container.classList.contains('hidden')) {
          container.classList.add('hidden');
          arrow?.classList.remove('expanded');
          if (text) text.textContent = 'Relevant Video';
        }
      }
    });
  }
  
  bindEvents() {
    this.playButton.addEventListener('click', () => this.togglePlay());
    this.prevButton.addEventListener('click', () => this.prevTrack());
    this.nextButton.addEventListener('click', () => this.nextTrack());
    this.downloadButton.addEventListener('click', () => this.showDownloadOptions());
    
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
    
    document.addEventListener('modalOpened', () => {
      if (this.isPlaying) {
        this.wasPlayingBeforeModal = true;
        this.pause();
      }
    });
    
    document.addEventListener('modalClosed', () => {
      if (this.wasPlayingBeforeModal) {
        this.wasPlayingBeforeModal = false;
        this.play();
      }
    });
    
    document.addEventListener('videoPlayed', () => {
      if (this.isPlaying) {
        this.pause();
      }
    });
  }
}

class AccessibilityMode {
  constructor() {
    this.isEnabled = false;
    this.storageKey = 'accessibility-mode';
    this.toggleButton = document.getElementById('accessibilityToggle');
    
    this.init();
  }
  
  init() {
    const savedState = localStorage.getItem(this.storageKey);
    if (savedState === 'true') {
      this.enable();
    }
    
    this.toggleButton?.addEventListener('click', () => this.toggle());
  }
  
  enable() {
    this.isEnabled = true;
    document.body.classList.add('accessibility-mode');
    localStorage.setItem(this.storageKey, 'true');
    this.updateButtonText();
  }
  
  disable() {
    this.isEnabled = false;
    document.body.classList.remove('accessibility-mode');
    localStorage.setItem(this.storageKey, 'false');
    this.updateButtonText();
  }
  
  toggle() {
    this.isEnabled ? this.disable() : this.enable();
  }
  
  updateButtonText() {
    if (this.toggleButton) {
      this.toggleButton.textContent = this.isEnabled ? 'Disable Accessibility' : 'Accessibility Mode';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const albumData = window.albumData;
  if (albumData?.tracks) {
    new AlbumPlayer(albumData.tracks, albumData);
  }
  
  window.mediaModal = new MediaModal();
  new AccessibilityMode();
});
