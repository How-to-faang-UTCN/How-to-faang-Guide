import fs from 'fs';
import path from 'path';

function ensureDirectoryExists(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function getMarkdownFiles(dir: string): string[] {
    try {
        const files = fs.readdirSync(dir);
        const markdownFiles = files.filter(file => file.endsWith('.md'));

        // Remove special files from the list
        const specialFiles = ['Readme.md', 'Open_Internships.md', 'Contribute.md'];
        specialFiles.forEach(file => {
            const index = markdownFiles.indexOf(file);
            if (index > -1) {
                markdownFiles.splice(index, 1);
            }
        });

        // Add special files in the correct order
        return [...specialFiles, ...markdownFiles];
    } catch (error) {
        console.error('Error reading directory:', error);
        return ['Readme.md', 'Open_Internships.md', 'Contribute.md'];
    }
}

function createDefaultReadme(dir: string) {
    const defaultContent = `# Welcome to UTCN FAANG Internship Guide

This guide provides comprehensive information about internship opportunities at top tech companies.

## Overview

This guide covers internship opportunities at:
- Google
- Amazon
- Microsoft
- Meta
- Apple
- Netflix
- And other top tech companies

Select a tab above to learn more about specific companies and their internship programs.`;

    fs.writeFileSync(path.join(dir, 'Readme.md'), defaultContent);
}

function createContributeGuide(dir: string) {
    const content = `# Contribute to UTCN FAANG Guide

We welcome contributions to this guide! This is a community-driven project aimed at helping UTCN students navigate their path to top tech companies.

## How to Contribute

1. Visit our [GitHub repository](https://github.com/How-to-faang-UTCN/How-to-faang-Guide)
2. Fork the repository
3. Make your changes
4. Submit a pull request

## Get in Touch

Feel free to reach out to any of the contributors listed on our GitHub repository. We're always happy to:
- Answer questions
- Review contributions
- Discuss improvements
- Share experiences

## Current Contributors

Check out our [GitHub repository](https://github.com/How-to-faang-UTCN/How-to-faang-Guide) to see the current list of contributors and get in touch with them.`;

    fs.writeFileSync(path.join(dir, 'Contribute.md'), content);
}

function createDefaultContent(dir: string, filename: string) {
    const defaultContent = `# ${filename.replace('.md', '')}

This guide is currently under construction. We're looking for contributors to help us build this guide!

## Want to Help?

Visit our [GitHub repository](https://github.com/How-to-faang-UTCN/How-to-faang-Guide) to contribute to this guide. We welcome any help in making this resource better for UTCN students!`;

    fs.writeFileSync(path.join(dir, filename), defaultContent);
}

function main() {
    const guidesDir = path.join(process.cwd(), 'guides');
    const publicGuidesDir = path.join(process.cwd(), 'public', 'guides');

    ensureDirectoryExists(guidesDir);
    ensureDirectoryExists(publicGuidesDir);

    const markdownFiles = getMarkdownFiles(guidesDir);

    // Create default Readme.md if it doesn't exist
    if (!fs.existsSync(path.join(guidesDir, 'Readme.md'))) {
        createDefaultReadme(guidesDir);
    }

    // Create Contribute.md if it doesn't exist
    if (!fs.existsSync(path.join(guidesDir, 'Contribute.md'))) {
        createContributeGuide(guidesDir);
    }

    // Create default content for empty files
    markdownFiles.forEach(file => {
        const filePath = path.join(guidesDir, file);
        if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf-8').trim() === '') {
            createDefaultContent(guidesDir, file);
        }
    });

    const manifest = {
        files: markdownFiles
    };

    // Write manifest to both locations
    fs.writeFileSync(
        path.join(guidesDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    fs.writeFileSync(
        path.join(publicGuidesDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    console.log('Manifest generated successfully with files:', markdownFiles);
}

main();