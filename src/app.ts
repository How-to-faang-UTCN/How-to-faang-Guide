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
            const response = await fetch('./manifest.json');
            if (!response.ok) {
                // Try alternative path
                const alternativeResponse = await fetch('./guides/manifest.json');
                if (!alternativeResponse.ok) {
                    throw new Error(`Failed to load manifest (status: ${response.status})`);
                }
                const manifest = await alternativeResponse.json();
                if (!manifest.files || !Array.isArray(manifest.files)) {
                    throw new Error('Invalid manifest format - missing files array');
                }
                this.markdownFiles = manifest.files;
                return;
            }
            const manifest = await response.json();
            if (!manifest.files || !Array.isArray(manifest.files)) {
                throw new Error('Invalid manifest format - missing files array');
            }
            this.markdownFiles = manifest.files;
        } catch (error) {
            console.error('Error loading manifest:', error);
            // Hardcode the files as fallback
            this.markdownFiles = [
                'Readme.md',
                'Open_Internships.md',
                'Contribute.md',
                'Amazon_Guide.md',
                'Bloomberg_Guide.md',
                'Google_Guide.md',
                'Jane_Street_Guide.md',
                'Microsoft_Guide.md',
                'Optiver_Guide.md'
            ];
        }
    }

    private createTabs() {
        this.tabsContainer.innerHTML = '';

        this.markdownFiles.forEach(file => {
            const tabName = file.replace('.md', '').replace(/_/g, ' ');

            const button = document.createElement('button');
            button.className = 'tab-button';
            button.textContent = tabName === 'Readme' ? 'Overview' : tabName;
            button.dataset.file = file;
            button.onclick = () => this.loadContent(file);

            this.tabsContainer.appendChild(button);
        });
    }

    private async loadContent(filename: string) {
        try {
            let response = await fetch(`./guides/${filename}`);

            // If not found in guides subdirectory, try the root
            if (!response.ok) {
                response = await fetch(`./${filename}`);
                if (!response.ok) {
                    throw new Error(`Failed to load content for ${filename} (status: ${response.status})`);
                }
            }

            const markdown = await response.text();
            this.renderMarkdown(markdown);
            this.updateActiveTab(filename);
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError(`Failed to load content for ${filename}. Please try again later.`);
        }
    }

    private renderMarkdown(markdown: string) {
        // Process the markdown in steps
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
            .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');

        // Handle line breaks
        const lines = html.split('\n');

        // Process lists
        let inList = false;
        let listHtml = '';
        let resultHtml = '';

        lines.forEach(line => {
            const listItemMatch = line.match(/^\s*[-*]\s+(.*)/);

            if (listItemMatch) {
                if (!inList) {
                    inList = true;
                    listHtml = '<ul>';
                }
                listHtml += `<li>${listItemMatch[1]}</li>`;
            } else {
                if (inList) {
                    inList = false;
                    listHtml += '</ul>';
                    resultHtml += listHtml;
                    listHtml = '';
                }
                resultHtml += line + '<br>';
            }
        });

        // If we were still in a list at the end
        if (inList) {
            listHtml += '</ul>';
            resultHtml += listHtml;
        }

        // Handle links last to avoid conflicts
        resultHtml = resultHtml.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

        this.contentContainer.innerHTML = resultHtml;
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