import { marked } from 'marked';
// Configure marked options
marked.setOptions({
    breaks: true,
    gfm: true
});
// Function to parse markdown with custom rendering
export async function parseMarkdown(markdown) {
    // Add custom CSS classes to tables
    const customizedMarkdown = markdown.replace(/^\|(.+)\|$/gm, (match) => `<div class="table-container">${match}</div>`);
    return marked(customizedMarkdown);
}
// Function to format tab names
export function formatTabName(filename) {
    if (filename === 'Readme.md')
        return 'Overview';
    return filename
        .replace('.md', '')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
