interface Tab {
    file: string;
    label: string;
}

class MarkdownViewer {
    private tabsContainer: HTMLElement;
    private contentContainer: HTMLElement;
    private markdownFiles: string[] = [];
    private basePath: string;

    constructor() {
        this.tabsContainer = document.getElementById('tabs')!;
        this.contentContainer = document.getElementById('content')!;
        // Get the base path from the current URL
        this.basePath = window.location.pathname.endsWith('/')
            ? window.location.pathname.slice(0, -1)
            : window.location.pathname;
        this.init();
    }

    private async init() {
        try {
            await this.detectMarkdownFiles();
            this.createTabs();
            this.loadContent('Readme.md');
        } catch (error) {
            console.error('Error initializing:', error);
            this.showError('Failed to load guides. Please try again later.');
        }
    }

    private async detectMarkdownFiles() {
        try {
            const response = await fetch('./guides/manifest.json');
            if (!response.ok) {
                throw new Error('Failed to load manifest');
            }
            const manifest = await response.json();
            if (!manifest.files || !Array.isArray(manifest.files)) {
                throw new Error('Invalid manifest format');
            }
            this.markdownFiles = manifest.files;
        } catch (error) {
            console.error('Error loading manifest:', error);
            this.markdownFiles = ['Readme.md'];
        }
    }

    private createTabs() {
        this.tabsContainer.innerHTML = '';
        this.markdownFiles.forEach(file => {
            const tabName = file.replace('.md', '').replace(/_/g, ' ');
            const button = document.createElement('button');
            button.className = 'tab-button';
            button.textContent = tabName === 'Readme' ? 'Overview' : tabName;
            button.onclick = () => this.loadContent(file);
            this.tabsContainer.appendChild(button);
        });
    }

    private async loadContent(filename: string) {
        try {
            const response = await fetch(`./guides/${filename}`);
            if (!response.ok) {
                throw new Error('Failed to load content');
            }
            const markdown = await response.text();
            this.renderMarkdown(markdown);
            this.updateActiveTab(filename);
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError('Failed to load content. Please try again later.');
        }
    }

    private renderMarkdown(markdown: string) {
        let html = markdown
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
            .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
            .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
            .replace(/\n/g, '<br>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/^\s*[-*]\s+(.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        this.contentContainer.innerHTML = html;
    }

    private updateActiveTab(filename: string) {
        const buttons = this.tabsContainer.getElementsByClassName('tab-button');
        Array.from(buttons).forEach(button => {
            button.classList.remove('active');
            const buttonText = button.textContent;
            const filenameText = filename.replace('.md', '').replace(/_/g, ' ');
            if ((buttonText === 'Overview' && filenameText === 'Readme') || buttonText === filenameText) {
                button.classList.add('active');
            }
        });
    }

    private showError(message: string) {
        this.contentContainer.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the viewer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownViewer();
}); 