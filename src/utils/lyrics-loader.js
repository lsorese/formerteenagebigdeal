import { createMarkdownRenderer } from './markdown-config';

// Import all lyrics files directly
import defaultLyrics from '../data/lyrics/default.html?raw';
import lyrics01 from '../data/lyrics/01-the-future-is-stupid.md?raw';
import lyrics02 from '../data/lyrics/02-route-666.md?raw';
import lyrics03 from '../data/lyrics/03-lisa-pell-the-tyrant-of-sillytown-usa.md?raw';
import lyrics04 from '../data/lyrics/04-emergency-broadcast.md?raw';
import lyrics05 from '../data/lyrics/05-40oz-stanley-adventure-quencher-travel-tumbler.md?raw';
import lyrics06 from '../data/lyrics/06-666-secret-steps.md?raw';
import lyrics07 from '../data/lyrics/07-heal-me-girly-girl-productions-cover.md?raw';
import lyrics08 from '../data/lyrics/08-joey-chestnut-vs-my-foreign-campaign-finance-records.md?raw';
import lyrics09 from '../data/lyrics/09-attn-k-mart-shoppers.md?raw';
import lyrics10 from '../data/lyrics/10-shamnow-thats-what-i-call-br00tal-death-metal.md?raw';
import lyrics11 from '../data/lyrics/11-this-is-not-financial-advice.md?raw';
import lyrics12 from '../data/lyrics/12-former-teenage-big-deal.md?raw';
import lyrics13 from '../data/lyrics/13-thats-an-outdated-idea-about-sexuality-babygirl.md?raw';
import lyrics14 from '../data/lyrics/14-the-trolley-problem-but-all-you-can-do-is-watch.md?raw';
import lyrics15 from '../data/lyrics/15-the-cult-of-teotwawki.md?raw';

// Create a map of track IDs to lyrics content
const lyricsMap = {
  1: lyrics01,
  2: lyrics02,
  3: lyrics03,
  4: lyrics04,
  5: lyrics05,
  6: lyrics06,
  7: lyrics07,
  8: lyrics08,
  9: lyrics09,
  10: lyrics10,
  11: lyrics11,
  12: lyrics12,
  13: lyrics13,
  14: lyrics14,
  15: lyrics15
};

export async function loadDefaultLyrics() {
  try {
    return processHtmlLinks(defaultLyrics);
  } catch (error) {
    console.warn('Could not load default lyrics:', error.message);
    return '<p>Select a track to view lyrics</p>';
  }
}

function processHtmlLinks(html) {
  return html.replace(/<a\s+([^>]*?)>/gi, (match, attributes) => {
    if (match.includes('target="_blank"')) return match;
    
    const hrefMatch = attributes.match(/href=["']([^"']*?)["']/i);
    if (!hrefMatch) return match;
    
    const href = hrefMatch[1];
    
    if (href === '#') return match;
    
    let updatedAttributes = attributes;
    
    updatedAttributes += ' target="_blank" rel="noopener noreferrer"';
    
    if (href.includes('youtube.com') || href.includes('youtu.be')) {
      if (!match.includes('class=')) {
        updatedAttributes += ' class="modal-trigger-youtube" style="cursor: pointer;"';
      } else {
        updatedAttributes = updatedAttributes.replace(/class=["']([^"']*?)["']/i, 'class="$1 modal-trigger-youtube"');
        if (!updatedAttributes.includes('style=')) {
          updatedAttributes += ' style="cursor: pointer;"';
        }
      }
    }
    
    return `<a ${updatedAttributes}>`;
  });
}

export async function loadTracksWithLyrics(albumData) {
  const md = createMarkdownRenderer();
  
  const enabledTracks = albumData.tracks.filter(track => track.enabled !== false);
  
  return await Promise.all(enabledTracks.map(async (track) => {
    try {
      const lyricsContent = lyricsMap[track.id];
      
      if (!lyricsContent) {
        throw new Error(`No lyrics found for track ID ${track.id}`);
      }
      
      return {
        ...track,
        lyricsHtml: md.render(lyricsContent)
      };
    } catch (error) {
      console.warn(`Could not load lyrics for ${track.title}:`, error.message);
      const fallbackMarkdown = `# ${track.title}\n\n*Lyrics not available*`;
      return {
        ...track,
        lyricsHtml: md.render(fallbackMarkdown)
      };
    }
  }));
}

export async function loadAllTracksWithLyrics(albumData) {
  const md = createMarkdownRenderer();
  
  return await Promise.all(albumData.tracks.map(async (track) => {
    try {
      const lyricsContent = lyricsMap[track.id];
      
      if (!lyricsContent) {
        throw new Error(`No lyrics found for track ID ${track.id}`);
      }
      
      return {
        ...track,
        lyricsHtml: md.render(lyricsContent)
      };
    } catch (error) {
      console.warn(`Could not load lyrics for ${track.title}:`, error.message);
      const fallbackMarkdown = `# ${track.title}\n\n*Lyrics not available*`;
      return {
        ...track,
        lyricsHtml: md.render(fallbackMarkdown)
      };
    }
  }));
}
