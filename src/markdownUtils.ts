import { marked } from 'marked';
import { shortnameToUnicode } from 'emoji-toolkit';

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

const renderer = {
    heading(text: string, level: number) {
        const slug = generateSlug(text);
        return `<h${level} id="${slug}">${text}</h${level}>`;
    },
    link(href: string, title: string | null | undefined, text: string) {
        if (!href || href.trim() === '') {
            return `<span class="invalid-link">${text}</span>`;
        }
        if (href.startsWith('#')) {
            return `<a href="${href}" ${title ? `title="${title}"` : ''}>${text}</a>`;
        }
        return `<a href="${href}" target="_blank" ${title ? `title="${title}"` : ''}>${text}</a>`;
    },
    text(text: string) {
        return shortnameToUnicode(text);
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
        .replace(/^# (.*$)/gm, (_, title) => `<h1 id="${generateSlug(title)}">${title}</h1>`)
        .replace(/^## (.*$)/gm, (_, title) => `<h2 id="${generateSlug(title)}">${title}</h2>`)
        .replace(/^### (.*$)/gm, (_, title) => `<h3 id="${generateSlug(title)}">${title}</h3>`)
        .replace(/^#### (.*$)/gm, (_, title) => `<h4 id="${generateSlug(title)}">${title}</h4>`)
        .replace(/^##### (.*$)/gm, (_, title) => `<h5 id="${generateSlug(title)}">${title}</h5>`)
        .replace(/^###### (.*$)/gm, (_, title) => `<h6 id="${generateSlug(title)}">${title}</h6>`)
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

    resultHtml = resultHtml.replace(/\[(.*?)\]\((.*?)\)/g, (_, text, href) => {
        // Handle empty or invalid href
        if (!href || href.trim() === '') {
            return `<span class="invalid-link">${text}</span>`;
        }
        if (href.startsWith('#')) {
            return `<a href="${href}">${text}</a>`;
        }
        return `<a href="${href}" target="_blank">${text}</a>`;
    });

    return resultHtml;
}

/**
 * Render markdown text to HTML, preserving any HTML tags and converting emojis
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