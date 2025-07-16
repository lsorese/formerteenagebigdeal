const toggleYouTubeVideo = (videoId) => {
  const container = document.getElementById(`youtube-${videoId}`);
  const toggle = container.parentElement.querySelector('.youtube-toggle');
  const arrow = toggle.querySelector('.youtube-toggle-arrow');
  const text = toggle.querySelector('.youtube-toggle-text');
  const iframe = container.querySelector('iframe');
  
  if (container.classList.contains('hidden')) {
    container.classList.remove('hidden');
    arrow.classList.add('expanded');
    text.textContent = 'Hide Sample';
    
    if (iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
    }
  } else {
    container.classList.add('hidden');
    arrow.classList.remove('expanded');
    text.textContent = 'Toggle Sample';
    
    iframe.src = '';
  }
};

window.toggleYouTubeVideo = toggleYouTubeVideo;