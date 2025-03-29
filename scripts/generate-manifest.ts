import fs from 'fs';
import path from 'path';

function ensureDirectoryExists(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function getMarkdownFiles(dir: string): string[] {
    try {
        // Get all files in the directory
        const files = fs.readdirSync(dir);

        // Filter for only .md files
        const allMarkdownFiles = files.filter(file => file.endsWith('.md'));

        // Log what we found for debugging
        console.log('Found markdown files:', allMarkdownFiles);

        // List of special files to prioritize at the top of the listing
        const specialFiles = ['Readme.md', 'Open_Internships.md', 'Contribute.md'];

        // Separate special files from regular files
        const priorityFiles: string[] = [];
        const regularFiles: string[] = [];

        allMarkdownFiles.forEach(file => {
            if (specialFiles.includes(file)) {
                // Keep the special files in their specified order
                priorityFiles[specialFiles.indexOf(file)] = file;
            } else {
                regularFiles.push(file);
            }
        });

        // Remove undefined entries from priority files (in case any are missing)
        const cleanPriorityFiles = priorityFiles.filter(Boolean);

        // Sort regular files alphabetically
        regularFiles.sort();

        // Combine the files with priority files first
        const result = [...cleanPriorityFiles, ...regularFiles];
        console.log('Final markdown files list:', result);
        return result;
    } catch (error) {
        console.error('Error reading directory:', error);
        return ['Readme.md'];
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

    // Make sure the guides directory exists
    ensureDirectoryExists(guidesDir);

    // Get all markdown files from the guides directory
    const markdownFiles = getMarkdownFiles(guidesDir);

    // Create default Readme.md if it doesn't exist
    if (!fs.existsSync(path.join(guidesDir, 'Readme.md'))) {
        createDefaultReadme(guidesDir);
    }

    // Create Contribute.md if it doesn't exist
    if (!fs.existsSync(path.join(guidesDir, 'Contribute.md'))) {
        createContributeGuide(guidesDir);
    }

    // Create Open_Internships.md if it doesn't exist
    if (!fs.existsSync(path.join(guidesDir, 'Open_Internships.md'))) {
        // Create a default internships file
        const defaultInternships = `# Open Internships

This page lists currently open internship opportunities at top tech companies.

## Internship Listings

Check back soon for updated listings!

## Resources for Finding Internships

- [LinkedIn Jobs](https://www.linkedin.com/jobs/)
- [Indeed](https://www.indeed.com/)
- [Glassdoor](https://www.glassdoor.com/)
- [Company career pages](https://careers.google.com/students/)`;

        fs.writeFileSync(path.join(guidesDir, 'Open_Internships.md'), defaultInternships);
    }

    // Create default content for company guides that don't exist
    const commonCompanies = ['Google_Guide.md', 'Amazon_Guide.md', 'Microsoft_Guide.md',
        'Bloomberg_Guide.md', 'Jane_Street_Guide.md', 'Optiver_Guide.md'];

    commonCompanies.forEach(file => {
        const filePath = path.join(guidesDir, file);
        if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf-8').trim() === '') {
            createDefaultContent(guidesDir, file);
        }
    });

    // Make sure all markdown files exist and have content
    markdownFiles.forEach(file => {
        const filePath = path.join(guidesDir, file);
        if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf-8').trim() === '') {
            createDefaultContent(guidesDir, file);
        }
    });

    // Create the manifest with all markdown files
    const manifest = {
        files: markdownFiles
    };

    // Write manifest to the guides directory
    fs.writeFileSync(
        path.join(guidesDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    // Create a backup of the manifest file
    fs.writeFileSync(
        path.join(guidesDir, 'manifest.json.bak'),
        JSON.stringify(manifest, null, 2)
    );

    console.log('Manifest generated successfully with files:', markdownFiles);
}

main();