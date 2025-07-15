window.toggleYouTubeVideo = function(videoId) {
  const container = document.getElementById(`youtube-${videoId}`);
  const toggle = container.parentElement.querySelector('.youtube-toggle');
  const arrow = toggle.querySelector('.youtube-toggle-arrow');
  const text = toggle.querySelector('.youtube-toggle-text');
  const iframe = container.querySelector('iframe');
  
  if (container.classList.contains('hidden')) {
    // Show video
    container.classList.remove('hidden');
    arrow.classList.add('expanded');
    text.textContent = 'Hide Sample';
    
    // Load the iframe src for performance (lazy loading)
    if (iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
    }
  } else {
    // Hide video and stop playback
    container.classList.add('hidden');
    arrow.classList.remove('expanded');
    text.textContent = 'Toggle Sample';
    
    // Stop video by clearing src (forces reload when reopened)
    iframe.src = '';
  }
};