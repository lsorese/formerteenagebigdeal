import { readFileSync } from 'fs';
import { join } from 'path';
import { createMarkdownRenderer } from './markdown-config';

export async function loadDefaultLyrics() {
  try {
    const lyricsPath = join(process.cwd(), 'src/data/lyrics/default.html');
    let lyricsContent = readFileSync(lyricsPath, 'utf-8');
    
    // Apply the same link processing as markdown files
    lyricsContent = processHtmlLinks(lyricsContent);
    
    return lyricsContent;
  } catch (error) {
    console.warn('Could not load default lyrics:', error.message);
    return '<p>Select a track to view lyrics</p>';
  }
}

function processHtmlLinks(html) {
  // Add target="_blank" and rel="noopener noreferrer" to all external links
  // Add modal trigger classes for YouTube links
  return html.replace(/<a\s+([^>]*?)>/gi, (match, attributes) => {
    // Skip if already has target="_blank"
    if (match.includes('target="_blank"')) {
      return match;
    }
    
    // Extract href value
    const hrefMatch = attributes.match(/href=["']([^"']*?)["']/i);
    if (!hrefMatch) {
      return match; // No href found
    }
    
    const href = hrefMatch[1];
    
    // Skip placeholder links
    if (href === '#') {
      return match;
    }
    
    let updatedAttributes = attributes;
    
    // Add target="_blank" and rel="noopener noreferrer"
    updatedAttributes += ' target="_blank" rel="noopener noreferrer"';
    
    // Add modal trigger class for YouTube links
    if (href.includes('youtube.com') || href.includes('youtu.be')) {
      if (!match.includes('class=')) {
        updatedAttributes += ' class="modal-trigger-youtube" style="cursor: pointer;"';
      } else {
        // Add to existing class attribute
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
  
  return await Promise.all(albumData.tracks.map(async (track) => {
    try {
      const lyricsPath = join(process.cwd(), track.lyricsFile);
      const lyricsContent = readFileSync(lyricsPath, 'utf-8');
      
      const lyricsHtml = md.render(lyricsContent);
      
      return {
        ...track,
        lyricsHtml
      };
    } catch (error) {
      console.warn(`Could not load lyrics for ${track.title}:`, error.message);
      const fallbackMarkdown = `# ${track.title}\n\n*Lyrics not available*`;
      const lyricsHtml = md.render(fallbackMarkdown);
      return {
        ...track,
        lyricsHtml
      };
    }
  }));
}