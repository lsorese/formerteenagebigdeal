class MediaModal {
    constructor() {
        this.modal = null;
        this.modalContent = null;
        this.isOpen = false;
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
                        <button class="modal-close" aria-label="Close modal">x</button>
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
        } catch {
            return false;
        }
    }

    isYouTubeLink(href) {
        try {
            const url = new URL(href);
            return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
        } catch {
            return false;
        }
    }

    getYouTubeEmbedUrl(url) {
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
        
        this.modalContent.innerHTML = `
            <div class="modal-video-container">
                <iframe 
                    src="${embedUrl}" 
                    title="${title}"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    class="modal-video">
                </iframe>
            </div>
            <div class="modal-caption">${title}</div>
        `;
        this.open();
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
        document.body.style.overflow = '';
        this.modalContent.innerHTML = '';
        
        document.dispatchEvent(new CustomEvent('modalClosed'));
    }
}

export default MediaModal;