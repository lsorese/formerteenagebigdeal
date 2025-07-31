function preloadAudio() {
  const audio = document.createElement('audio');
  const tracks = window.albumData?.tracks || [];
  
  const getOptimalFormat = () => {
    if (audio.canPlayType('audio/webm; codecs="vorbis"')) return 'webm';
    if (audio.canPlayType('audio/aac') || audio.canPlayType('audio/mp4')) return 'aac';
    return 'mp3';
  };
  
  const format = getOptimalFormat();
  
  tracks.forEach(track => {
    const baseUrl = track.url.replace('/mp3/', '');
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = `/${format}/${baseUrl}.${format}`;
    link.as = 'audio';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preloadAudio);
} else {
  preloadAudio();
}
