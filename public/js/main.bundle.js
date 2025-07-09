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

/***/ "./src/js/player.js":
/*!**************************!*\
  !*** ./src/js/player.js ***!
  \**************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\nclass AlbumPlayer {\n\tconstructor(tracks) {\n\t\tthis.tracks = tracks;\n\t\tthis.currentTrack = 0;\n\t\tthis.isPlaying = false;\n\t\tthis.sound = null;\n\t\tthis.volume = 1.0;\n\t\t\n\t\tthis.playButton = document.getElementById('playButton');\n\t\tthis.progressBar = document.getElementById('progressBar');\n\t\tthis.progressFill = document.getElementById('progressFill');\n\t\tthis.timeDisplay = document.getElementById('timeDisplay');\n\t\t\n\t\tthis.initializePlayer();\n\t\tthis.bindEvents();\n\t}\n\t\n\tinitializePlayer() {\n\t\tthis.loadTrack(this.currentTrack);\n\t}\n\t\n\tloadTrack(index) {\n\t\tif (this.sound) {\n\t\t\tthis.sound.stop();\n\t\t\tthis.sound.unload();\n\t\t}\n\t\t\n\t\tconst track = this.tracks[index];\n\t\tthis.sound = new Howl({\n\t\t\tsrc: [track.url],\n\t\t\thtml5: true,\n\t\t\tvolume: this.volume,\n\t\t\tonend: () => this.nextTrack()\n\t\t});\n\t\t\n\t\tthis.updateTrackDisplay();\n\t}\n\t\n\tplay() {\n\t\tif (!this.sound) return;\n\t\t\n\t\tthis.sound.play();\n\t\tthis.isPlaying = true;\n\t\tthis.playButton.textContent = '⏸ Pause';\n\t\tthis.updateProgress();\n\t}\n\t\n\tpause() {\n\t\tif (!this.sound) return;\n\t\t\n\t\tthis.sound.pause();\n\t\tthis.isPlaying = false;\n\t\tthis.playButton.textContent = '▶ Play';\n\t}\n\t\n\ttogglePlay() {\n\t\tif (this.isPlaying) {\n\t\t\tthis.pause();\n\t\t} else {\n\t\t\tthis.play();\n\t\t}\n\t}\n\t\n\tnextTrack() {\n\t\tthis.currentTrack = (this.currentTrack + 1) % this.tracks.length;\n\t\tthis.loadTrack(this.currentTrack);\n\t\tif (this.isPlaying) {\n\t\t\tthis.play();\n\t\t}\n\t}\n\t\n\tselectTrack(index) {\n\t\tthis.currentTrack = index;\n\t\tthis.loadTrack(index);\n\t\tthis.play();\n\t}\n\t\n\tupdateProgress() {\n\t\tif (!this.sound || !this.isPlaying) return;\n\t\t\n\t\tconst seek = this.sound.seek() || 0;\n\t\tconst duration = this.sound.duration() || 0;\n\t\t\n\t\tif (duration > 0) {\n\t\t\tconst progress = (seek / duration) * 100;\n\t\t\tthis.progressFill.style.width = progress + '%';\n\t\t\tthis.timeDisplay.textContent = this.formatTime(seek);\n\t\t}\n\t\t\n\t\tif (this.isPlaying) {\n\t\t\trequestAnimationFrame(() => this.updateProgress());\n\t\t}\n\t}\n\t\n\tupdateTrackDisplay() {\n\t\tdocument.querySelectorAll('.track').forEach(track => {\n\t\t\ttrack.classList.remove('playing');\n\t\t});\n\t\t\n\t\tconst currentTrackElement = document.querySelector(`[data-track-id=\"${this.currentTrack + 1}\"]`);\n\t\tif (currentTrackElement) {\n\t\t\tcurrentTrackElement.classList.add('playing');\n\t\t}\n\t}\n\t\n\t\n\t\n\tformatTime(seconds) {\n\t\tconst minutes = Math.floor(seconds / 60);\n\t\tconst remainingSeconds = Math.floor(seconds % 60);\n\t\treturn `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;\n\t}\n\t\n\tbindEvents() {\n\t\tthis.playButton.addEventListener('click', () => this.togglePlay());\n\t\t\n\t\tthis.progressBar.addEventListener('click', (e) => {\n\t\t\tif (!this.sound) return;\n\t\t\t\n\t\t\tconst rect = this.progressBar.getBoundingClientRect();\n\t\t\tconst percent = (e.clientX - rect.left) / rect.width;\n\t\t\tconst duration = this.sound.duration();\n\t\t\t\n\t\t\tif (duration > 0) {\n\t\t\t\tthis.sound.seek(duration * percent);\n\t\t\t}\n\t\t});\n\t\t\n\t\t\n\t\tdocument.querySelectorAll('.track').forEach((track, index) => {\n\t\t\ttrack.addEventListener('click', () => this.selectTrack(index));\n\t\t});\n\t}\n}\n\n// Initialize the player when the page loads\ndocument.addEventListener('DOMContentLoaded', () => {\n\tconst albumData = window.albumData;\n\tif (albumData && albumData.tracks) {\n\t\tnew AlbumPlayer(albumData.tracks);\n\t}\n});\n\n//# sourceURL=webpack://music-player/./src/js/player.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
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
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/player.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;