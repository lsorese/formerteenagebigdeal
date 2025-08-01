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
      // Add mobile optimizations to embed URL
      const isMobile = window.innerWidth <= 768;
      let embedUrl = iframe.dataset.src;
      
      // Add mobile-friendly parameters
      if (embedUrl.includes('youtube.com/embed/')) {
        const urlParams = new URLSearchParams();
        urlParams.set('rel', '0'); // Don't show related videos
        urlParams.set('modestbranding', '1'); // Minimal YouTube branding
        if (isMobile) {
          urlParams.set('playsinline', '1'); // Play inline on mobile
        }
        
        // Append parameters to URL
        const separator = embedUrl.includes('?') ? '&' : '?';
        embedUrl += separator + urlParams.toString();
      }
      
      iframe.src = embedUrl;
      
      document.dispatchEvent(new CustomEvent('videoPlayed'));
    }
  } else {
    container.classList.add('hidden');
    arrow.classList.remove('expanded');
    text.textContent = 'Relevant Video';
    
    iframe.src = '';
    
    document.dispatchEvent(new CustomEvent('videoStopped'));
  }
};

window.toggleYouTubeVideo = toggleYouTubeVideo;
