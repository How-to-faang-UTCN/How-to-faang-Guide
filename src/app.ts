import {
    extractFilenamesFromHtml,
    renderMarkdown,
    sortMarkdownFiles
} from './markdownUtils';
import {
    fetchManifest,
    loadMarkdownContent,
    getCommonMarkdownFiles,
    filenameToDisplayName
} from './fileUtils';

class MarkdownViewer {
    private tabsContainer: HTMLElement;
    private contentContainer: HTMLElement;
    private markdownFiles: string[] = [];
    private basePath: string;

    constructor() {
        this.tabsContainer = document.getElementById('tabs')!;
        this.contentContainer = document.getElementById('content')!;
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
            // Try to fetch the manifest
            const manifest = await fetchManifest();
            if (manifest) {
                this.markdownFiles = manifest.files;
                return;
            }

            // If manifest fails, try directory listing
            await this.detectFilesDirectly();
        } catch (error) {
            console.error('Error loading manifest:', error);
            await this.detectFilesDirectly();
        }
    }

    private async detectFilesDirectly() {
        console.error('Trying to detect markdown files directly...');
        try {
            // Try to fetch directory listing
            const guidesResponse = await fetch('./guides/');
            if (guidesResponse.ok) {
                const html = await guidesResponse.text();
                // Extract filenames from directory listing HTML
                const mdFiles = extractFilenamesFromHtml(html);
                if (mdFiles.length > 0) {
                    console.error(`Found ${mdFiles.length} markdown files directly.`);
                    this.markdownFiles = sortMarkdownFiles(mdFiles);
                    return;
                }
            }

            // If we couldn't get the directory listing, try fetching some common files directly
            console.error('Trying common markdown files...');
            const commonFiles = getCommonMarkdownFiles();
            const foundFiles = [];

            for (const file of commonFiles) {
                const content = await loadMarkdownContent(file);
                if (content) {
                    foundFiles.push(file);
                }
            }

            if (foundFiles.length > 0) {
                console.error(`Found ${foundFiles.length} markdown files by direct check.`);
                this.markdownFiles = sortMarkdownFiles(foundFiles);
                return;
            }

            // Last resort: show error to user
            console.error('Could not find any markdown files.');
            this.showError('Failed to load guides. Please check your network connection and try again.');
        } catch (e) {
            console.error('Error detecting files directly:', e);
            this.showError('Failed to load guides. Please try again later.');
        }
    }

    private createTabs() {
        this.tabsContainer.innerHTML = '';

        this.markdownFiles.forEach(file => {
            const tabName = filenameToDisplayName(file);

            const button = document.createElement('button');
            button.className = 'tab-button';
            button.textContent = tabName;
            button.dataset.file = file;
            button.onclick = () => this.loadContent(file);

            this.tabsContainer.appendChild(button);
        });
    }

    private async loadContent(filename: string) {
        try {
            const markdown = await loadMarkdownContent(filename);
            if (!markdown) {
                throw new Error(`Failed to load content for ${filename} from any path`);
            }

            this.contentContainer.innerHTML = renderMarkdown(markdown);
            this.updateActiveTab(filename);
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError(`Failed to load content for ${filename}. Please try again later.`);
        }
    }

    private updateActiveTab(filename: string) {
        const buttons = this.tabsContainer.getElementsByClassName('tab-button');
        Array.from(buttons).forEach(button => {
            button.classList.remove('active');
            if ((button as HTMLElement).dataset.file === filename) {
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