/**
 * Minimal test with full error output
 */

import 'dotenv/config';
import { DocboxClient, DocboxError } from './src';

async function minimalTest() {
    const docbox = new DocboxClient({
        baseUrl: process.env.DOCBOX_BASE_URL!,
        apiKey: process.env.DOCBOX_API_KEY!,
        cloudId: process.env.DOCBOX_CLOUD_ID
    });

    console.log('Testing with config:');
    console.log('- Base URL:', process.env.DOCBOX_BASE_URL);
    console.log('- API Key:', process.env.DOCBOX_API_KEY?.substring(0, 10) + '...');
    console.log('- Cloud ID:', process.env.DOCBOX_CLOUD_ID);
    console.log('');

    try {
        const result = await docbox.getArchiveStructure();
        console.log('\n✅ SUCCESS!');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        if (error instanceof DocboxError) {
            console.log('\n❌ API Error:');
            console.log('Status:', error.statusCode);
            console.log('Message:', error.message);
            console.log('\nFull Response Body:');
            console.log(error.responseBody);
        } else {
            console.log('\n❌ Other Error:');
            console.log(error);
        }
    }
}

minimalTest();
