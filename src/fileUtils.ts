/**
 * Fetch a file from multiple possible paths
 */
export async function fetchFileFromPaths(paths: string[]): Promise<Response | null> {
    for (const path of paths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                return response;
            }
        } catch (e) {
            // Continue to next path
        }
    }
    return null;
}

/**
 * Fetch manifest file from various locations
 */
export async function fetchManifest(): Promise<{ files: string[] } | null> {
    const possiblePaths = [
        './manifest.json',
        './guides/manifest.json',
        '/manifest.json',
        '/guides/manifest.json'
    ];

    const response = await fetchFileFromPaths(possiblePaths);
    if (response) {
        try {
            const manifest = await response.json();
            if (manifest && manifest.files && Array.isArray(manifest.files)) {
                return manifest;
            }
        } catch (e) {
            console.error('Error parsing manifest JSON:', e);
        }
    }

    return null;
}

/**
 * Load markdown content from a file
 */
export async function loadMarkdownContent(filename: string): Promise<string | null> {
    const possiblePaths = [
        `./guides/${filename}`,
        `./${filename}`,
        `/guides/${filename}`,
        `/${filename}`
    ];

    const response = await fetchFileFromPaths(possiblePaths);
    if (response) {
        try {
            return await response.text();
        } catch (e) {
            console.error(`Error loading content for ${filename}:`, e);
        }
    }

    return null;
}

/**
 * Get common markdown files to try if manifest fails
 */
export function getCommonMarkdownFiles(): string[] {
    return ['Readme.md'];
}

/**
 * Parse filename to display name
 */
export function filenameToDisplayName(filename: string): string {
    const name = filename.replace('.md', '').replace(/_/g, ' ');
    return name === 'Readme' ? 'Overview' : name;
} 