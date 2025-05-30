import {
    containsHtml,
    processMarkdownBlock,
    renderMarkdown,
    extractFilenamesFromHtml,
    sortMarkdownFiles
} from '../markdownUtils';

describe('containsHtml', () => {
    test('should return true when text contains HTML tags', () => {
        expect(containsHtml('<div>Hello world</div>')).toBe(true);
        expect(containsHtml('Some text with <span>HTML</span> tags')).toBe(true);
        expect(containsHtml('<h1>This is a heading</h1>')).toBe(true);
    });

    test('should return false when text does not contain HTML tags', () => {
        expect(containsHtml('Hello world')).toBe(false);
        expect(containsHtml('# Markdown heading')).toBe(false);
        expect(containsHtml('**Bold text**')).toBe(false);
    });
});

describe('processMarkdownBlock', () => {
    test('should convert headings correctly', () => {
        expect(processMarkdownBlock('# Heading 1')).toContain('<h1 id="heading-1">Heading 1</h1>');
        expect(processMarkdownBlock('## Heading 2')).toContain('<h2 id="heading-2">Heading 2</h2>');
        expect(processMarkdownBlock('### Heading 3')).toContain('<h3 id="heading-3">Heading 3</h3>');
    });

    test('should convert formatting correctly', () => {
        expect(processMarkdownBlock('**Bold text**')).toContain('<strong>Bold text</strong>');
        expect(processMarkdownBlock('*Italic text*')).toContain('<em>Italic text</em>');
        expect(processMarkdownBlock('`Code text`')).toContain('<code>Code text</code>');
    });

    test('should convert lists correctly', () => {
        const markdownList = '- Item 1\n- Item 2\n- Item 3';
        const result = processMarkdownBlock(markdownList);
        expect(result).toContain('<ul>');
        expect(result).toContain('<li>Item 1</li>');
        expect(result).toContain('<li>Item 2</li>');
        expect(result).toContain('<li>Item 3</li>');
        expect(result).toContain('</ul>');
    });

    test('should convert links correctly', () => {
        const markdown = '[Link text](https://example.com)';
        const result = processMarkdownBlock(markdown);
        expect(result).toContain('<a href="https://example.com" target="_blank">Link text</a>');
    });
});

describe('renderMarkdown', () => {
    test('should handle pure markdown text', () => {
        const markdown = '# Heading\n\nSome paragraph text\n\n- List item 1\n- List item 2';
        const result = renderMarkdown(markdown);
        expect(result).toContain('<h1 id="heading">Heading</h1>');
        expect(result).toContain('<p>Some paragraph text</p>');
        expect(result).toContain('<li>List item 1</li>');
    });

    test('should preserve HTML tags', () => {
        const markdown = '<div class="custom">\n# Heading inside div\n</div>\n\n# Heading outside div';
        const result = renderMarkdown(markdown);
        expect(result).toContain('<div class="custom">');
        expect(result).toContain('# Heading inside div');
        expect(result).toContain('</div>');
        expect(result).toContain('<h1 id="heading-outside-div">Heading outside div</h1>');
    });
});

describe('extractFilenamesFromHtml', () => {
    test('should extract markdown filenames from HTML', () => {
        const html = `
      <ul>
        <li><a href="Readme.md">Readme.md</a></li>
        <li><a href="Open_Internships.md">Open_Internships.md</a></li>
        <li><a href="Google_Guide.md">Google_Guide.md</a></li>
      </ul>
    `;
        const result = extractFilenamesFromHtml(html);
        expect(result).toContain('Readme.md');
        expect(result).toContain('Open_Internships.md');
        expect(result).toContain('Google_Guide.md');
        expect(result.length).toBe(3);
    });

    test('should handle paths in URLs', () => {
        const html = `
      <ul>
        <li><a href="/guides/Readme.md">Readme.md</a></li>
        <li><a href="./guides/Open_Internships.md">Open_Internships.md</a></li>
      </ul>
    `;
        const result = extractFilenamesFromHtml(html);
        expect(result).toContain('Readme.md');
        expect(result).toContain('Open_Internships.md');
        expect(result.length).toBe(2);
    });
});

describe('sortMarkdownFiles', () => {
    test('should sort files with Readme.md first', () => {
        const files = ['Google_Guide.md', 'Readme.md', 'Amazon_Guide.md'];
        const result = sortMarkdownFiles(files);
        expect(result[0]).toBe('Readme.md');
    });

    test('should prioritize Open_Internships.md after Readme.md', () => {
        const files = ['Google_Guide.md', 'Open_Internships.md', 'Amazon_Guide.md'];
        const result = sortMarkdownFiles(files);
        expect(result[0]).toBe('Open_Internships.md');
    });

    test('should sort the rest alphabetically', () => {
        const files = ['Google_Guide.md', 'Amazon_Guide.md', 'Microsoft_Guide.md'];
        const result = sortMarkdownFiles(files);
        expect(result[0]).toBe('Amazon_Guide.md');
        expect(result[1]).toBe('Google_Guide.md');
        expect(result[2]).toBe('Microsoft_Guide.md');
    });
});

describe('generateSlug', () => {
    it('should convert text to lowercase', () => {
        const result = processMarkdownBlock('# Hello World');
        expect(result).toContain('id="hello-world"');
    });

    it('should replace spaces with hyphens', () => {
        const result = processMarkdownBlock('# Hello World');
        expect(result).toContain('id="hello-world"');
    });

    it('should remove special characters', () => {
        const result = processMarkdownBlock('# Hello, World!');
        expect(result).toContain('id="hello-world"');
    });

    it('should handle multiple spaces', () => {
        const result = processMarkdownBlock('# Hello    World');
        expect(result).toContain('id="hello-world"');
    });

    it('should handle multiple hyphens', () => {
        const result = processMarkdownBlock('# Hello---World');
        expect(result).toContain('id="hello-world"');
    });
});

describe('link handling', () => {
    it('should handle internal anchor links', () => {
        const result = processMarkdownBlock('[Link to section](#section)');
        expect(result).toContain('<a href="#section">Link to section</a>');
    });

    it('should handle external links with target="_blank"', () => {
        const result = processMarkdownBlock('[External Link](https://example.com)');
        expect(result).toContain('<a href="https://example.com" target="_blank">External Link</a>');
    });

    it('should handle empty links', () => {
        const result = processMarkdownBlock('[Empty Link]()');
        expect(result).toContain('<span class="invalid-link">Empty Link</span>');
    });

    it('should handle multiple links in the same block', () => {
        const result = processMarkdownBlock(`
            [Internal](#section)
            [External](https://example.com)
            [Empty]()
        `);
        expect(result).toContain('<a href="#section">Internal</a>');
        expect(result).toContain('<a href="https://example.com" target="_blank">External</a>');
        expect(result).toContain('<span class="invalid-link">Empty</span>');
    });
});
