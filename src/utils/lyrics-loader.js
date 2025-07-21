import { readFileSync } from 'fs';
import { join } from 'path';
import { createMarkdownRenderer } from './markdown-config';

export async function loadDefaultLyrics() {
  const md = createMarkdownRenderer();
  
  try {
    const lyricsPath = join(process.cwd(), 'src/data/lyrics/default.html');
    const lyricsContent = readFileSync(lyricsPath, 'utf-8');
        
    return lyricsContent;
  } catch (error) {
    console.warn('Could not load default lyrics:', error.message);
    return '<p>Select a track to view lyrics</p>';
  }
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