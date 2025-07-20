const toggleYouTubeVideo = (videoId) => {
  const container = document.getElementById(`youtube-${videoId}`);
  const toggle = container.parentElement.querySelector('.youtube-toggle');
  const arrow = toggle.querySelector('.youtube-toggle-arrow');
  const text = toggle.querySelector('.youtube-toggle-text');
  const iframe = container.querySelector('iframe');
  
  if (container.classList.contains('hidden')) {
    container.classList.remove('hidden');
    arrow.classList.add('expanded');
    text.textContent = 'Hide Video';
    
    if (iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
      
      // Dispatch event to pause music when video starts loading
      const videoPlayEvent = new CustomEvent('videoPlayed');
      document.dispatchEvent(videoPlayEvent);
    }
  } else {
    container.classList.add('hidden');
    arrow.classList.remove('expanded');
    text.textContent = 'Relevant Video';
    
    iframe.src = '';
    
    // Dispatch event when video is hidden/stopped
    const videoStoppedEvent = new CustomEvent('videoStopped');
    document.dispatchEvent(videoStoppedEvent);
  }
};

window.toggleYouTubeVideo = toggleYouTubeVideo;