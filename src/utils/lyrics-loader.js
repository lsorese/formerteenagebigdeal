import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { createMarkdownRenderer } from './markdown-config';

export async function loadDefaultLyrics() {
  try {
    const lyricsPath = join(process.cwd(), 'src/data/lyrics/default.html');
    const lyricsContent = readFileSync(lyricsPath, 'utf-8');
    return processHtmlLinks(lyricsContent);
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
      // Remove leading slash if present to avoid double slashes
      const relativePath = track.lyricsFile.startsWith('/') ? track.lyricsFile.slice(1) : track.lyricsFile;
      const lyricsPath = resolve(process.cwd(), relativePath);
      
      // Check if file exists first
      if (!existsSync(lyricsPath)) {
        throw new Error(`File not found: ${lyricsPath}`);
      }
      
      const lyricsContent = readFileSync(lyricsPath, 'utf-8');
      
      // Check if content is empty
      if (!lyricsContent.trim()) {
        throw new Error(`File is empty: ${lyricsPath}`);
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
      // Remove leading slash if present to avoid double slashes
      const relativePath = track.lyricsFile.startsWith('/') ? track.lyricsFile.slice(1) : track.lyricsFile;
      const lyricsPath = resolve(process.cwd(), relativePath);
      
      // Check if file exists first
      if (!existsSync(lyricsPath)) {
        throw new Error(`File not found: ${lyricsPath}`);
      }
      
      const lyricsContent = readFileSync(lyricsPath, 'utf-8');
      
      // Check if content is empty
      if (!lyricsContent.trim()) {
        throw new Error(`File is empty: ${lyricsPath}`);
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
