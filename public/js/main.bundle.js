/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/modal.js":
/*!*************************!*\
  !*** ./src/js/modal.js ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nclass MediaModal {\n    constructor() {\n        this.modal = null;\n        this.modalContent = null;\n        this.isOpen = false;\n        this.createModal();\n        this.bindEvents();\n    }\n\n    createModal() {\n        // Create modal structure\n        this.modal = document.createElement('div');\n        this.modal.className = 'media-modal';\n        this.modal.innerHTML = `\n            <div class=\"modal-backdrop\">\n                <div class=\"modal-container\">\n                    <div class=\"modal-header\">\n                        <button class=\"modal-close\" aria-label=\"Close modal\">&times;</button>\n                    </div>\n                    <div class=\"modal-body\">\n                        <div class=\"modal-content\"></div>\n                    </div>\n                </div>\n            </div>\n        `;\n        \n        document.body.appendChild(this.modal);\n        this.modalContent = this.modal.querySelector('.modal-content');\n    }\n\n    bindEvents() {\n        // Close modal events\n        const closeBtn = this.modal.querySelector('.modal-close');\n        const backdrop = this.modal.querySelector('.modal-backdrop');\n        \n        closeBtn.addEventListener('click', () => this.close());\n        backdrop.addEventListener('click', (e) => {\n            if (e.target === backdrop) this.close();\n        });\n        \n        // Keyboard events\n        document.addEventListener('keydown', (e) => {\n            if (e.key === 'Escape' && this.isOpen) this.close();\n        });\n\n        // Auto-detect and bind media links\n        this.bindMediaLinks();\n    }\n\n    bindMediaLinks() {\n        // Find all images and YouTube links in the document\n        document.addEventListener('click', (e) => {\n            const target = e.target;\n            \n            // Handle image clicks\n            if (target.tagName === 'IMG' && this.isLocalImage(target.src)) {\n                e.preventDefault();\n                this.openImage(target.src, target.alt || 'Image');\n            }\n            \n            // Handle YouTube links\n            if (target.tagName === 'A' && this.isYouTubeLink(target.href)) {\n                e.preventDefault();\n                this.openYouTube(target.href, target.textContent);\n            }\n        });\n    }\n\n    isLocalImage(src) {\n        // Check if image is from same server (relative or same domain)\n        try {\n            const url = new URL(src, window.location.href);\n            return url.hostname === window.location.hostname && \n                   /\\.(png|jpg|jpeg|gif|webp)$/i.test(url.pathname);\n        } catch {\n            return false;\n        }\n    }\n\n    isYouTubeLink(href) {\n        try {\n            const url = new URL(href);\n            return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');\n        } catch {\n            return false;\n        }\n    }\n\n    getYouTubeEmbedUrl(url) {\n        try {\n            const urlObj = new URL(url);\n            let videoId = '';\n            \n            if (urlObj.hostname.includes('youtu.be')) {\n                videoId = urlObj.pathname.slice(1);\n            } else if (urlObj.hostname.includes('youtube.com')) {\n                videoId = urlObj.searchParams.get('v');\n            }\n            \n            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;\n        } catch {\n            return null;\n        }\n    }\n\n    openImage(src, alt = 'Image') {\n        this.modalContent.innerHTML = `\n            <img src=\"${src}\" alt=\"${alt}\" class=\"modal-image\">\n            <div class=\"modal-caption\">${alt}</div>\n        `;\n        this.open();\n    }\n\n    openYouTube(url, title = 'Video') {\n        const embedUrl = this.getYouTubeEmbedUrl(url);\n        if (!embedUrl) return;\n        \n        this.modalContent.innerHTML = `\n            <div class=\"modal-video-container\">\n                <iframe \n                    src=\"${embedUrl}\" \n                    title=\"${title}\"\n                    frameborder=\"0\" \n                    allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" \n                    allowfullscreen\n                    class=\"modal-video\">\n                </iframe>\n            </div>\n            <div class=\"modal-caption\">${title}</div>\n        `;\n        this.open();\n    }\n\n    open() {\n        this.modal.classList.add('active');\n        this.isOpen = true;\n        document.body.style.overflow = 'hidden';\n        \n        // Focus management for accessibility\n        const closeBtn = this.modal.querySelector('.modal-close');\n        closeBtn.focus();\n    }\n\n    close() {\n        this.modal.classList.remove('active');\n        this.isOpen = false;\n        document.body.style.overflow = '';\n        this.modalContent.innerHTML = '';\n    }\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MediaModal);\n\n//# sourceURL=webpack://music-player/./src/js/modal.js?\n}");

/***/ }),

/***/ "./src/js/player.js":
/*!**************************!*\
  !*** ./src/js/player.js ***!
  \**************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _modal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modal.js */ \"./src/js/modal.js\");\n\n\nclass AlbumPlayer {\n\tconstructor(tracks) {\n\t\tthis.tracks = tracks;\n\t\tthis.currentTrack = 0;\n\t\tthis.isPlaying = false;\n\t\tthis.sound = null;\n\t\tthis.volume = 1.0;\n\t\t\n\t\tthis.playButton = document.getElementById('playButton');\n\t\tthis.progressBar = document.getElementById('progressBar');\n\t\tthis.progressFill = document.getElementById('progressFill');\n\t\tthis.timeDisplay = document.getElementById('timeDisplay');\n\t\tthis.lyricsContainer = document.getElementById('lyricsContainer');\n\t\tthis.lyricsContent = document.getElementById('lyricsContent');\n\t\tthis.lyricsText = document.getElementById('lyricsText');\n\t\tthis.lyricsTitle = document.getElementById('lyricsTitle');\n\t\tthis.currentTrackTitle = document.getElementById('currentTrackTitle');\n\t\tthis.currentTrackArtist = document.getElementById('currentTrackArtist');\n\t\t\n\t\tthis.initializePlayer();\n\t\tthis.bindEvents();\n\t}\n\t\n\tinitializePlayer() {\n\t\tthis.loadTrack(this.currentTrack);\n\t\tthis.updateLyrics();\n\t}\n\t\n\tloadTrack(index) {\n\t\tif (this.sound) {\n\t\t\tthis.sound.stop();\n\t\t\tthis.sound.unload();\n\t\t}\n\t\t\n\t\tconst track = this.tracks[index];\n\t\tthis.sound = new Howl({\n\t\t\tsrc: [track.url],\n\t\t\thtml5: true,\n\t\t\tvolume: this.volume,\n\t\t\tonend: () => this.nextTrack()\n\t\t});\n\t\t\n\t\tthis.updateTrackDisplay();\n\t}\n\t\n\tplay() {\n\t\tif (!this.sound) return;\n\t\t\n\t\tthis.sound.play();\n\t\tthis.isPlaying = true;\n\t\tthis.playButton.textContent = '⏸ Pause';\n\t\tthis.updateProgress();\n\t}\n\t\n\tpause() {\n\t\tif (!this.sound) return;\n\t\t\n\t\tthis.sound.pause();\n\t\tthis.isPlaying = false;\n\t\tthis.playButton.textContent = '▶ Play';\n\t}\n\t\n\ttogglePlay() {\n\t\tif (this.isPlaying) {\n\t\t\tthis.pause();\n\t\t} else {\n\t\t\tthis.play();\n\t\t}\n\t}\n\t\n\tnextTrack() {\n\t\tthis.currentTrack = (this.currentTrack + 1) % this.tracks.length;\n\t\tthis.loadTrack(this.currentTrack);\n\t\tif (this.isPlaying) {\n\t\t\tthis.play();\n\t\t}\n\t}\n\t\n\tselectTrack(index) {\n\t\tthis.currentTrack = index;\n\t\tthis.loadTrack(index);\n\t\tthis.play();\n\t}\n\t\n\tupdateProgress() {\n\t\tif (!this.sound || !this.isPlaying) return;\n\t\t\n\t\tconst seek = this.sound.seek() || 0;\n\t\tconst duration = this.sound.duration() || 0;\n\t\t\n\t\tif (duration > 0) {\n\t\t\tconst progress = (seek / duration) * 100;\n\t\t\tthis.progressFill.style.width = progress + '%';\n\t\t\tthis.timeDisplay.textContent = this.formatTime(seek);\n\t\t}\n\t\t\n\t\tif (this.isPlaying) {\n\t\t\trequestAnimationFrame(() => this.updateProgress());\n\t\t}\n\t}\n\t\n\tupdateTrackDisplay() {\n\t\tdocument.querySelectorAll('.track').forEach(track => {\n\t\t\ttrack.classList.remove('playing');\n\t\t});\n\t\t\n\t\tconst currentTrackElement = document.querySelector(`[data-track-id=\"${this.currentTrack + 1}\"]`);\n\t\tif (currentTrackElement) {\n\t\t\tcurrentTrackElement.classList.add('playing');\n\t\t}\n\t\t\n\t\tthis.updateCurrentlyPlaying();\n\t\tthis.updateLyrics();\n\t}\n\t\n\tupdateCurrentlyPlaying() {\n\t\tconst currentTrack = this.tracks[this.currentTrack];\n\t\tif (currentTrack) {\n\t\t\tthis.currentTrackTitle.textContent = currentTrack.title;\n\t\t} else {\n\t\t\tthis.currentTrackTitle.textContent = 'Select a track to play';\n\t\t}\n\t}\n\t\n\tupdateLyrics() {\n\t\tconst currentTrack = this.tracks[this.currentTrack];\n\t\tif (currentTrack) {\n\t\t\tthis.lyricsTitle.textContent = `Lyrics - ${currentTrack.title}`;\n\t\t\tthis.lyricsContainer.style.display = 'block';\n\t\t\t\n\t\t\t// Hide all lyrics\n\t\t\tdocument.querySelectorAll('.lyrics-text').forEach(lyricsEl => {\n\t\t\t\tlyricsEl.classList.add('hidden');\n\t\t\t});\n\t\t\t\n\t\t\t// Show current track's lyrics\n\t\t\tconst currentLyricsEl = document.getElementById(`lyricsText-${currentTrack.id}`);\n\t\t\tif (currentLyricsEl) {\n\t\t\t\tcurrentLyricsEl.classList.remove('hidden');\n\t\t\t}\n\t\t} else {\n\t\t\tthis.lyricsContainer.style.display = 'block';\n\t\t}\n\t}\n\t\n\t\n\t\n\t\n\tformatTime(seconds) {\n\t\tconst minutes = Math.floor(seconds / 60);\n\t\tconst remainingSeconds = Math.floor(seconds % 60);\n\t\treturn `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;\n\t}\n\t\n\tbindEvents() {\n\t\tthis.playButton.addEventListener('click', () => this.togglePlay());\n\t\t\n\t\tthis.progressBar.addEventListener('click', (e) => {\n\t\t\tif (!this.sound) return;\n\t\t\t\n\t\t\tconst rect = this.progressBar.getBoundingClientRect();\n\t\t\tconst percent = (e.clientX - rect.left) / rect.width;\n\t\t\tconst duration = this.sound.duration();\n\t\t\t\n\t\t\tif (duration > 0) {\n\t\t\t\tthis.sound.seek(duration * percent);\n\t\t\t}\n\t\t});\n\t\t\n\t\t\n\t\tdocument.querySelectorAll('.track').forEach((track, index) => {\n\t\t\ttrack.addEventListener('click', () => this.selectTrack(index));\n\t\t});\n\t}\n}\n\n// Initialize the player when the page loads\ndocument.addEventListener('DOMContentLoaded', () => {\n\tconst albumData = window.albumData;\n\tif (albumData && albumData.tracks) {\n\t\tnew AlbumPlayer(albumData.tracks);\n\t}\n\t\n\t// Initialize the modal component\n\tnew _modal_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n});\n\n//# sourceURL=webpack://music-player/./src/js/player.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/player.js");
/******/ 	
/******/ })()
;