/**
 * Example usage of the Docbox API Client
 * 
 * This file demonstrates how to use the various features of the Docbox API client.
 */

import 'dotenv/config';
import { DocboxClient, DocboxError } from './src';
import { readFileSync } from 'fs';

async function main() {
    // Validate environment variables
    if (!process.env.DOCBOX_API_KEY) {
        console.error('❌ Error: DOCBOX_API_KEY is not set in .env file');
        process.exit(1);
    }

    // Initialize the client
    const docbox = new DocboxClient({
        baseUrl: process.env.DOCBOX_BASE_URL || 'https://api.docbox.eu',
        apiKey: process.env.DOCBOX_API_KEY,
        cloudId: process.env.DOCBOX_CLOUD_ID, // Optional for cloud version
        port: process.env.DOCBOX_PORT ? parseInt(process.env.DOCBOX_PORT) : 8081
    });

    console.log('🔧 Docbox API Client initialized');
    console.log(`   Base URL: ${process.env.DOCBOX_BASE_URL || 'https://api.docbox.eu'}`);
    console.log(`   Port: ${process.env.DOCBOX_PORT || 8081}`);
    console.log(`   API Key: ${process.env.DOCBOX_API_KEY.substring(0, 8)}...`);
    console.log(`   Cloud ID: ${process.env.DOCBOX_CLOUD_ID || '(not set)'}`);
    console.log('');

    try {
        // Example 1: Get archive structure
        console.log('📁 Fetching archive structure...');
        const archive = await docbox.getArchiveStructure();
        console.log('Archive folders:', archive.folders);

        // Example 2: Get structure for a specific folder
        if (archive.folders.length > 0) {
            const firstFolder = archive.folders[0];
            console.log(`\n📂 Fetching structure for folder ${firstFolder.name}...`);
            const subfolder = await docbox.getArchiveStructure({
                parentFolderId: firstFolder.id
            });
            console.log('Subfolders:', subfolder.folders);
        }

        // Example 3: List documents in a folder
        // (Commented out - requires valid folder ID)
        // console.log('\n📄 Listing documents...');
        // const documents = await docbox.listDocuments({
        //     folderId: 123, // Replace with actual folder ID
        //     subfoldersRecursive: true,
        //     withAutoexportStatus: true
        // });
        // console.log(`Found ${documents.documents?.length || 0} documents`);

        // Example 4: List documents with date filter
        // (Commented out - requires valid folder ID)
        // console.log('\n📅 Listing recent documents...');
        // const recentDocs = await docbox.listDocuments({
        //     folderId: 123,
        //     filterDateCreatedAfter: new Date('2024-01-01'),
        //     includedMetadataKeys: 'invoice_number,customer_name'
        // });
        // console.log('Recent documents:', recentDocs.documents);

        // Example 5: Upload a file
        console.log('\n📤 Uploading a file...');
        // const fileBuffer = readFileSync('path/to/your/file.pdf');
        // const uploadResult = await docbox.uploadFile({
        //   fileData: fileBuffer,
        //   fileName: 'example.pdf',
        //   targetFolderId: 123,
        //   targetDocumentName: 'Example Document',
        //   keywords: ['example', 'test'],
        //   documentTypes: ['Invoice'],
        //   externalId: 'EXT-001',
        //   externalMetadata: {
        //     customer_id: '12345',
        //     invoice_number: 'INV-2024-001'
        //   }
        // });
        // console.log('Upload result:', uploadResult);

        // Example 6: Create a new folder
        // (Commented out - requires valid parent folder ID)
        // console.log('\n📁 Creating a new folder...');
        // const createResult = await docbox.createFolder({
        //     name: 'Test Folder ' + new Date().toISOString(),
        //     parentFolderId: 123 // Replace with actual parent folder ID
        // });
        // console.log('Folder created:', createResult);

        // Example 7: List inbox folders
        console.log('\n📥 Listing inbox folders...');
        const inboxes = await docbox.listInboxes();
        console.log('Inboxes:', inboxes.inboxes);

    } catch (error) {
        if (error instanceof DocboxError) {
            console.error('❌ Docbox API Error:');
            console.error('  Message:', error.message);
            console.error('  Status Code:', error.statusCode);
            console.error('  Response:', error.responseBody);
        } else {
            console.error('❌ Unexpected error:', error);
        }
        process.exit(1);
    }
}

// Run the examples
if (require.main === module) {
    main().then(() => {
        console.log('\n✅ All examples completed successfully!');
    }).catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
