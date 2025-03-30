import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const guidesDir = path.join(__dirname, '..', 'guides');
const manifestPath = path.join(guidesDir, 'manifest.json');

/**
 * Generates a manifest file containing all the markdown files in the guides directory
 */
async function generateManifest() {
    try {
        console.log('Scanning guides directory for markdown files...');

        const files = fs.readdirSync(guidesDir);

        const markdownFiles = files.filter(file =>
            file.endsWith('.md') &&
            fs.statSync(path.join(guidesDir, file)).isFile()
        );

        if (markdownFiles.length === 0) {
            console.error('No markdown files found in guides directory!');
            return;
        }

        console.log(`Found ${markdownFiles.length} markdown files.`);

        const sortedFiles = sortMarkdownFiles(markdownFiles);

        const manifest = {
            files: sortedFiles
        };

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

        console.log(`Successfully created manifest with ${sortedFiles.length} files.`);
        console.log('Manifest saved to:', manifestPath);
        console.log('Files included:', sortedFiles);
    } catch (error) {
        console.error('Error generating manifest:', error);
    }
}

/**
 * Sort markdown files to ensure a consistent order
 * @param files Array of filenames
 * @returns Sorted array of filenames
 */
function sortMarkdownFiles(files: string[]): string[] {
    const priorityFiles = [
        'Readme.md',
        'Open_Internships.md',
        'Contribute.md'
    ];

    return files.sort((a, b) => {
        const aPriority = priorityFiles.indexOf(a);
        const bPriority = priorityFiles.indexOf(b);

        if (aPriority !== -1 && bPriority !== -1) {
            return aPriority - bPriority;
        }

        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;

        return a.localeCompare(b);
    });
}

generateManifest();