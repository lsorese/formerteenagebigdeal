function isYouTubeUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
  } catch {
    return false;
  }
}

function getYouTubeEmbedUrl(url) {
  try {
    const urlObj = new URL(url);
    let videoId = '';
    
    if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export function youtubePlugin(md) {
  // Rule for ;;youtube-url;; syntax
  md.inline.ruler.before('link', 'youtube_custom', function(state, silent) {
    const start = state.pos;
    const marker = ';;';
    
    if (state.src.slice(start, start + marker.length) !== marker) {
      return false;
    }
    
    const end = state.src.indexOf(marker, start + marker.length);
    if (end === -1) {
      return false;
    }
    
    const url = state.src.slice(start + marker.length, end);
    
    // Check if it's a YouTube URL
    if (!isYouTubeUrl(url)) {
      return false;
    }
    
    if (!silent) {
      const token = state.push('youtube_embed', 'div', 0);
      token.content = url;
      token.markup = marker;
    }
    
    state.pos = end + marker.length;
    return true;
  });
  
  // Rule for standalone YouTube URLs on their own line
  md.block.ruler.before('paragraph', 'youtube_standalone', function(state, start, end, silent) {
    const pos = state.bMarks[start] + state.tShift[start];
    const max = state.eMarks[start];
    const line = state.src.slice(pos, max).trim();
    
    // Check if line is just a YouTube URL
    if (!isYouTubeUrl(line)) {
      return false;
    }
    
    // Check if it's on its own line (not part of a paragraph)
    const nextLine = start + 1;
    if (nextLine < end) {
      const nextPos = state.bMarks[nextLine] + state.tShift[nextLine];
      const nextMax = state.eMarks[nextLine];
      const nextLineContent = state.src.slice(nextPos, nextMax).trim();
      
      // If next line has content and isn't empty, treat as regular paragraph
      if (nextLineContent && !isYouTubeUrl(nextLineContent)) {
        return false;
      }
    }
    
    if (!silent) {
      const token = state.push('youtube_embed', 'div', 0);
      token.content = line;
      token.map = [start, start + 1];
    }
    
    state.line = start + 1;
    return true;
  });
  
  // Renderer for YouTube embeds
  md.renderer.rules.youtube_embed = function(tokens, idx) {
    const token = tokens[idx];
    const url = token.content;
    const embedUrl = getYouTubeEmbedUrl(url);
    
    if (!embedUrl) {
      return `<p><a href="${url}" target="_blank">${url}</a></p>`;
    }
    
    const videoId = Math.random().toString(36).substring(7);
    
    return `<div class="youtube-collapsible" data-video-id="${videoId}">
      <div class="youtube-toggle" onclick="toggleYouTubeVideo('${videoId}')">
        <span class="youtube-toggle-text">Relevant Video</span>
        <span class="youtube-toggle-arrow">&gt;</span>
      </div>
      <div class="youtube-embed-container hidden" id="youtube-${videoId}">
        <iframe 
          src="" 
          data-src="${embedUrl}"
          title="YouTube video"
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
          class="youtube-embed">
        </iframe>
      </div>
    </div>`;
  };
}

export function censorPlugin(md) {
  md.core.ruler.after('inline', 'censor', function(state) {
    for (let i = 0; i < state.tokens.length; i++) {
      if (state.tokens[i].type === 'inline' && state.tokens[i].children) {
        let children = state.tokens[i].children;
        for (let j = 0; j < children.length; j++) {
          let child = children[j];
          if (child.type === 'text' && child.content.includes('censor')) {
            // Split the text around 'censor' and create new tokens
            let parts = child.content.split(/\b(censor)\b/);
            let newTokens = [];
            
            for (let k = 0; k < parts.length; k++) {
              if (parts[k] === 'censor') {
                // Create HTML inline token for the span
                let htmlToken = new state.Token('html_inline', '', 0);
                htmlToken.content = '<span class="censor"></span>';
                newTokens.push(htmlToken);
              } else if (parts[k]) {
                // Create text token for non-censor parts
                let textToken = new state.Token('text', '', 0);
                textToken.content = parts[k];
                newTokens.push(textToken);
              }
            }
            
            // Replace the original child with new tokens
            children.splice(j, 1, ...newTokens);
            j += newTokens.length - 1; // Adjust index for added tokens
          }
        }
      }
    }
  });
}