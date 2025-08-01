class MediaModal {
    constructor() {
        this.modal = null;
        this.modalContent = null;
        this.isOpen = false;
        this.instructionsOpen = false;
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'media-modal';
        this.modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-container">
                    <div class="modal-header">
                        <button class="modal-close" aria-label="Close modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-content"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.modalContent = this.modal.querySelector('.modal-content');
    }

    bindEvents() {
        const closeBtn = this.modal.querySelector('.modal-close');
        const backdrop = this.modal.querySelector('.modal-backdrop');
        
        closeBtn.addEventListener('click', () => this.close());
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) this.close();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });

        this.bindMediaLinks();
    }

    bindMediaLinks() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.tagName === 'IMG' && this.isLocalImage(target.src)) {
                e.preventDefault();
                this.openImage(target.src, target.alt || 'Image');
            }
            
            if (target.tagName === 'A' && this.isLocalImage(target.href)) {
                e.preventDefault();
                this.openImage(target.href, target.textContent || 'Image');
            }
            
            if (target.tagName === 'A' && this.isYouTubeLink(target.href)) {
                e.preventDefault();
                this.openYouTube(target.href, target.textContent);
            }
        });
    }

    isLocalImage(src) {
        try {
            const url = new URL(src, window.location.href);
            return url.hostname === window.location.hostname && 
                   /\.(png|jpg|jpeg|gif|webp)$/i.test(url.pathname);
        } catch { return false; }
    }

    isYouTubeLink(href) {
        try {
            const url = new URL(href);
            return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
        } catch { return false; }
    }

    getYouTubeEmbedUrl(url) {
        try {
            const urlObj = new URL(url);
            let videoId = urlObj.hostname.includes('youtu.be') 
                ? urlObj.pathname.slice(1)
                : urlObj.searchParams.get('v');
            
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        } catch { return null; }
    }

    extractVideoId(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.includes('youtu.be') 
                ? urlObj.pathname.slice(1)
                : urlObj.searchParams.get('v');
        } catch { return null; }
    }

    loadYouTubeIframe(embedUrl, title) {
        const container = this.modalContent.querySelector('.modal-video-container');
        container.innerHTML = `
            <iframe 
                src="${embedUrl}?autoplay=1&rel=0&modestbranding=1" 
                title="${title}"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                class="modal-video"
                loading="lazy">
            </iframe>
        `;
    }

    openImage(src, alt = 'Image') {
        this.modalContent.innerHTML = `
            <img src="${src}" alt="${alt}" class="modal-image">
            <div class="modal-caption">${alt}</div>
        `;
        this.open();
    }

    openYouTube(url, title = 'Video') {
        const embedUrl = this.getYouTubeEmbedUrl(url);
        if (!embedUrl) return;
        
        // Add mobile-optimized loading with thumbnail preview
        const isMobile = window.innerWidth <= 768;
        const videoId = this.extractVideoId(url);
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        
        if (isMobile) {
            // On mobile, show thumbnail first with play button overlay
            this.modalContent.innerHTML = `
                <div class="modal-video-container">
                    <div class="video-thumbnail-container" data-embed-url="${embedUrl}" data-title="${title}">
                        <img src="${thumbnailUrl}" alt="${title} thumbnail" class="video-thumbnail">
                        <div class="video-play-overlay">
                            <svg class="play-button-icon" viewBox="0 0 68 48">
                                <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                                <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="modal-caption">${title}</div>
            `;
            
            // Add click handler to load iframe when user taps
            const thumbnailContainer = this.modalContent.querySelector('.video-thumbnail-container');
            thumbnailContainer.addEventListener('click', () => {
                this.loadYouTubeIframe(embedUrl, title);
            });
        } else {
            // Desktop: load iframe immediately but with optimizations
            this.modalContent.innerHTML = `
                <div class="modal-video-container">
                    <iframe 
                        src="${embedUrl}?autoplay=0&rel=0&modestbranding=1" 
                        title="${title}"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        class="modal-video"
                        loading="lazy">
                    </iframe>
                </div>
                <div class="modal-caption">${title}</div>
            `;
        }
        
        this.open();
    }

    openVideo(url, title = 'Video') {
        this.modalContent.innerHTML = `
            <div class="modal-video-container">
                <iframe 
                    src="${url}" 
                    title="${title}"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    class="modal-video"
                    width="560"
                    height="315">
                </iframe>
            </div>
            <div class="modal-caption">${title}</div>
        `;
        this.open();
    }

    openInstructions() {
        this.modalContent.innerHTML = `
            <div class="modal-text-content instructions-modal">
                <h2><How to Play<br />The Internet Simulator</h2>
                <div class="instructions-content">
                    <p><strong>Movement:</strong></p>
                    <ul>
                        <li>Use <strong>WASD</strong> or <strong>Arrow Keys</strong> to move on desktop.</li>
                        <li>On mobile, use the <strong>directional pad</strong>.</li>
                    </ul>
                    
                    <p><strong>Gameplay:</strong></p>
                    <ul>
                        <li>Move around the colorful grid to explore.</li>
                        <li>Read each block's name and decide if this is content you want to watch.</li>
                        <li>Just like the big internet, some content will make you happy and laugh, or haunt and traumatize you.</li>
                        <li>Viewing some content will give you points, others will take them away from you.</li>
                        <li>These points are a metaphor, but I'll leave the specifics up to you.</li>
                        <li>If you run out of points, you crash out.</li>
                        <li>There's no limit on positive points, but there's no trophy either.</li>
                    </ul>
                </div>
                <div class="instructions-footer">
                    <p><em>Everything you invite in becomes part of you. Choose your demons wisely.</em></p>
                </div>
            </div>
        `;
        this.instructionsOpen = true;
        this.open();
    }

    async openMarkdown(url, title = 'Content') {
        try {
            const response = await fetch(url);
            const text = await response.text();
            const html = this.renderMarkdown(text);
            
            this.modalContent.innerHTML = `
                <div class="modal-text-content">
                    ${html}
                </div>
                <div class="modal-caption">${title}</div>
            `;
            this.open();
        } catch (error) {
            console.error('Failed to load markdown:', error);
            this.openText('Failed to load content', title);
        }
    }

    async openText(url, title = 'Text') {
        try {
            const content = (typeof url === 'string' && url.startsWith('http'))
                ? await (await fetch(url)).text()
                : url;
            
            this.modalContent.innerHTML = `
                <div class="modal-text-content">
                    <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.6;">${content}</pre>
                </div>
                <div class="modal-caption">${title}</div>
            `;
            this.open();
        } catch (error) {
            console.error('Failed to load text:', error);
            this.modalContent.innerHTML = `
                <div class="modal-text-content">
                    <p>Failed to load content</p>
                </div>
                <div class="modal-caption">${title}</div>
            `;
            this.open();
        }
    }

    renderMarkdown(markdown) {
        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Strikethrough
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');

        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background-color: #f8f8f8; padding: 16px; border-radius: 6px; overflow-x: auto; border-left: 3px solid #007acc;"><code>$2</code></pre>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #007acc; text-decoration: none;">$1</a>');

        // Blockquotes
        html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; font-style: italic;">$1</blockquote>');

        // Unordered lists
        html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul style="padding-left: 20px;">$1</ul>');

        // Ordered lists
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
        
        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        // Wrap in paragraphs
        html = '<p>' + html + '</p>';

        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>)/g, '$1');
        html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

        return html;
    }

    open() {
        this.modal.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
        document.dispatchEvent(new CustomEvent('modalOpened'));
        
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.focus();
    }

    close() {
        this.modal.classList.remove('active');
        this.isOpen = false;
        this.instructionsOpen = false;
        document.body.style.overflow = '';
        this.modalContent.innerHTML = '';
        
        document.dispatchEvent(new CustomEvent('modalClosed'));
    }
}

export default MediaModal;
