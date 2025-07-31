// Smart preloading: detect browser support and preload only the best format
function preloadAudio() {
	const audio = document.createElement('audio');
	const tracks = window.albumData?.tracks || [];
	
	tracks.forEach(track => {
		const baseUrl = track.url.replace('/mp3/', '');
		let formatUrl;
		
		// Test format support in priority order
		if (audio.canPlayType('audio/webm; codecs="vorbis"')) {
			formatUrl = `/webm/${baseUrl}.webm`;
		} else if (audio.canPlayType('audio/aac') || audio.canPlayType('audio/mp4')) {
			formatUrl = `/aac/${baseUrl}.aac`;
		} else {
			formatUrl = `/mp3/${baseUrl}.mp3`;
		}
		
		// Create preload link
		const link = document.createElement('link');
		link.rel = 'preload';
		link.href = formatUrl;
		link.as = 'audio';
		link.crossOrigin = 'anonymous';
		document.head.appendChild(link);
	});
}

// Preload after DOM is ready and albumData is available
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', preloadAudio);
} else {
	preloadAudio();
}