import { config } from 'dotenv';
import { DocboxClient } from '../dist/index.js';

// Load environment variables
config();

/**
 * Example: Search for documents containing "urlaubsantrag"
 * 
 * This demonstrates how to use the search API to find documents by name
 */
async function searchForUrlaubsantrag() {
    // Get configuration from environment variables
    const baseUrl = process.env.DOCBOX_BASE_URL;
    const apiKey = process.env.DOCBOX_API_KEY;

    if (!baseUrl || !apiKey) {
        console.error('Error: DOCBOX_BASE_URL and DOCBOX_API_KEY must be set in .env file');
        process.exit(1);
    }

    const client = new DocboxClient({
        baseUrl,
        apiKey
    });

    const searchTerm = 'urlaubsantrag';

    try {
        console.log(`Searching for documents with "${searchTerm}" in the name...\n`);

        // Search for documents with "urlaubsantrag" in the name
        const results = await client.search({
            documentNameTerms: searchTerm,
            paginationSize: 100  // Get up to 100 results
        });

        console.log('Search response:', results);

        const totalHits = (results as any).totalHitDocuments || 0;

        if (totalHits === 0) {
            console.log(`\nNo documents found matching "${searchTerm}"`);
            return;
        }

        console.log(`\nFound ${totalHits} document(s) matching "${searchTerm}":\n`);
        console.log('='.repeat(80));

        results.documents.forEach((doc, index) => {
            console.log(`\n${index + 1}. Document ID: ${doc.id}`);
            console.log(`   Name: ${doc.name}`);
            console.log(`   Folder ID: ${doc.folderId}`);

            if (doc.folderPath) {
                console.log(`   Folder Path: ${doc.folderPath}`);
            }

            if (doc.creationDate) {
                console.log(`   Created: ${doc.creationDate}`);
            }

            if (doc.pages && doc.pages.length > 0) {
                console.log(`   Pages: ${doc.pages.length}`);
                // Show which pages had hits
                const hitPages = doc.pages.filter(p => p.hit);
                if (hitPages.length > 0) {
                    console.log(`   Hit Pages: ${hitPages.map(p => p.id).join(', ')}`);
                }
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log(`\nTotal matches: ${totalHits}`);

    } catch (error) {
        console.error('Error searching documents:', error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

searchForUrlaubsantrag();
