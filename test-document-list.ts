/**
 * Test the document list endpoint
 */

import 'dotenv/config';
import { DocboxClient } from './src/index';

async function testDocumentList() {
    console.log('🔍 Testing Docbox API - Document List');
    console.log('======================================\n');

    const client = new DocboxClient({
        baseUrl: process.env.DOCBOX_BASE_URL || 'https://cloud.docbox.eu:8081',
        apiKey: process.env.DOCBOX_API_KEY || '',
        cloudId: process.env.DOCBOX_CLOUD_ID
    });

    try {
        console.log('📂 Fetching documents from folder ID: 0\n');
        const result = await client.listDocuments({ folderId: 0 });

        console.log('✅ Success!');
        console.log('\n📊 Results:');
        console.log(JSON.stringify(result, null, 2));

        if (result.documents) {
            console.log(`\n📄 Found ${result.documents.length} document(s)`);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testDocumentList();
