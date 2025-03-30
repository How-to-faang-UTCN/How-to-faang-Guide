import {
    filenameToDisplayName,
    getCommonMarkdownFiles,
    fetchFileFromPaths,
    fetchManifest,
    loadMarkdownContent
} from '../fileUtils';
import { createMockResponse, setupFetchMock, resetFetchMock } from './fetchMock';

describe('filenameToDisplayName', () => {
    test('should convert Readme.md to Overview', () => {
        expect(filenameToDisplayName('Readme.md')).toBe('Overview');
    });

    test('should replace underscores with spaces', () => {
        expect(filenameToDisplayName('Google_Guide.md')).toBe('Google Guide');
        expect(filenameToDisplayName('Open_Internships.md')).toBe('Open Internships');
    });

    test('should remove .md extension', () => {
        expect(filenameToDisplayName('Contribute.md')).toBe('Contribute');
    });
});

describe('getCommonMarkdownFiles', () => {
    test('should return an array with at least Readme.md', () => {
        const result = getCommonMarkdownFiles();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toContain('Readme.md');
    });
});

describe('fetch-dependent functions', () => {
    beforeEach(() => {
        setupFetchMock({});
    });

    afterEach(() => {
        resetFetchMock();
        jest.resetAllMocks();
    });

    describe('fetchFileFromPaths', () => {
        test('should return the first successful response', async () => {
            const mockResponses = {
                '/path1.txt': createMockResponse(404, 'Not found'),
                '/path2.txt': createMockResponse(200, 'File content', 'text/plain')
            };
            setupFetchMock(mockResponses);

            const result = await fetchFileFromPaths(['/path1.txt', '/path2.txt', '/path3.txt']);
            expect(result).not.toBeNull();
            expect(result?.ok).toBe(true);
            const text = await result?.text();
            expect(text).toBe('File content');
        });

        test('should return null if all paths fail', async () => {
            const mockResponses = {
                '/path1.txt': createMockResponse(404, 'Not found'),
                '/path2.txt': createMockResponse(500, 'Server error')
            };
            setupFetchMock(mockResponses);

            const result = await fetchFileFromPaths(['/path1.txt', '/path2.txt']);
            expect(result).toBeNull();
        });
    });

    describe('fetchManifest', () => {
        test('should return manifest if a valid one is found', async () => {
            const mockManifest = {
                files: ['Readme.md', 'Google_Guide.md']
            };
            const mockResponses = {
                '/manifest.json': createMockResponse(404, 'Not found'),
                '/guides/manifest.json': createMockResponse(200, mockManifest, 'application/json')
            };
            setupFetchMock(mockResponses);

            const result = await fetchManifest();
            expect(result).not.toBeNull();
            expect(result?.files).toEqual(['Readme.md', 'Google_Guide.md']);
        });

        test('should return null if no valid manifest is found', async () => {
            const mockResponses = {
                '/manifest.json': createMockResponse(404, 'Not found'),
                '/guides/manifest.json': createMockResponse(200, { notFiles: [] }, 'application/json') // Invalid format
            };
            setupFetchMock(mockResponses);

            const result = await fetchManifest();
            expect(result).toBeNull();
        });
    });

    describe('loadMarkdownContent', () => {
        test('should return content from the first valid path', async () => {
            const mockContent = '# Markdown Content';
            const mockResponses = {
                '/guides/Readme.md': createMockResponse(200, mockContent, 'text/plain')
            };
            setupFetchMock(mockResponses);

            const result = await loadMarkdownContent('Readme.md');
            expect(result).toBe(mockContent);
        });

        test('should return null if no path succeeds', async () => {
            const mockResponses = {
                '/guides/Missing.md': createMockResponse(404, 'Not found')
            };
            setupFetchMock(mockResponses);

            const result = await loadMarkdownContent('Missing.md');
            expect(result).toBeNull();
        });
    });
}); 