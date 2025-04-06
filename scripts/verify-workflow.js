import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

const WORKFLOW_PATH = join(process.cwd(), '.github', 'workflows', 'netlify-deploy.yml');

function _generateHash(filePath) {
    const fileContent = readFileSync(filePath, 'utf-8');
    return createHash('sha256').update(fileContent).digest('hex');
}

function main() {
    try {
        const hash = _generateHash(WORKFLOW_PATH);
        console.log('Workflow file hash:', hash);
        console.log('\nTo update the hash in GitHub:');
        console.log('1. Go to repository Settings -> Secrets and variables -> Actions');
        console.log('2. Update the WORKFLOW_HASH secret with this value:');
        console.log(hash);
    } catch (error) {
        console.error('Error generating hash:', error);
        process.exit(1);
    }
}

main();  