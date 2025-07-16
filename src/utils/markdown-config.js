import MarkdownIt from 'markdown-it';
import { youtubePlugin, censorPlugin } from './markdown-plugins';

export function createMarkdownRenderer() {
  const md = new MarkdownIt({ 
    breaks: true,
    linkify: true,
    html: true
  });

  // Add plugins
  md.use(youtubePlugin);
  md.use(censorPlugin);

  // Configure custom renderer for images
  md.renderer.rules.image = function (tokens, idx, options, env) {
    const token = tokens[idx];
    const src = token.attrGet('src');
    const alt = token.content || token.attrGet('alt') || '';
    
    // Check if it's a local image (same domain or relative path)
    const isLocal = !src.startsWith('http') || src.includes(window?.location?.hostname || '');
    
    if (isLocal && /\.(png|jpg|jpeg|gif|webp)$/i.test(src)) {
      return `<img src="${src}" alt="${alt}" class="modal-trigger-image" style="cursor: pointer; max-width: 100%; height: auto;">`;
    }
    
    return `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto;">`;
  };

  // Configure custom renderer for links
  md.renderer.rules.link_open = function (tokens, idx, options, env) {
    const token = tokens[idx];
    const href = token.attrGet('href');
    
    // Check if it's a YouTube link
    if (href && (href.includes('youtube.com') || href.includes('youtu.be'))) {
      token.attrSet('class', 'modal-trigger-youtube');
      token.attrSet('style', 'cursor: pointer;');
    }
    
    // Add target="_blank" to all links
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noopener noreferrer');
    
    const classAttr = token.attrGet('class') ? ` class="${token.attrGet('class')}"` : '';
    const styleAttr = token.attrGet('style') ? ` style="${token.attrGet('style')}"` : '';
    
    return `<a href="${href}"${classAttr}${styleAttr} target="_blank" rel="noopener noreferrer">`;
  };

  return md;
}