import { marked } from 'marked';

const renderer = {
    link(href: string, title: string | null | undefined, text: string) {
        return `<a href="${href}" target="_blank" ${title ? `title="${title}"` : ''}>${text}</a>`;
    }
};

marked.use({ renderer });

/**
 * Checks if text contains HTML tags
 */
export function containsHtml(text: string): boolean {
    return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * Process a block of pure Markdown text into HTML
 */
export function processMarkdownBlock(text: string): string {
    let html = text
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

    return resultHtml;
}

/**
 * Render markdown text to HTML, preserving any HTML tags
 */
export function renderMarkdown(markdown: string): string {
    try {
        return marked.parse(markdown, {
            breaks: true,     // Convert \n to <br>
            gfm: true,        // Enable GitHub Flavored Markdown
        }) as string;        // Force sync mode
    } catch (error) {
        console.error('Error rendering markdown:', error);
        return `<div class="error-message">
            <h2>Error</h2>
            <p>Failed to render content. Please try again later.</p>
        </div>`;
    }
}

/**
 * Extract markdown filenames from HTML directory listing
 */
export function extractFilenamesFromHtml(html: string): string[] {
    const mdFiles = [];
    // Basic regex to find markdown files in directory listing
    const regex = /href="([^"]+\.md)"/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
        const filename = match[1];
        // Extract just the filename, not the full path
        const basename = filename.split('/').pop();
        if (basename) {
            mdFiles.push(basename);
        }
    }

    return mdFiles;
}

/**
 * Sort markdown files in preferred order
 */
export function sortMarkdownFiles(files: string[]): string[] {
    return files.sort((a, b) => {
        if (a === 'Readme.md') return -1;
        if (b === 'Readme.md') return 1;
        if (a === 'Open_Internships.md' && b !== 'Readme.md') return -1;
        if (b === 'Open_Internships.md' && a !== 'Readme.md') return 1;
        if (a === 'Contribute.md' && b !== 'Readme.md' && b !== 'Open_Internships.md') return -1;
        if (b === 'Contribute.md' && a !== 'Readme.md' && a !== 'Open_Internships.md') return 1;
        return a.localeCompare(b);
    });
} 