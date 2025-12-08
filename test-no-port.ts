/**
 * Test Docbox API without explicit port (use default HTTPS 443)
 */

import 'dotenv/config';

async function testNoPort() {
    const baseUrl = process.env.DOCBOX_BASE_URL || 'https://cloud.docbox.eu';
    const apiKey = process.env.DOCBOX_API_KEY;
    const cloudId = process.env.DOCBOX_CLOUD_ID;

    console.log('🔍 Testing Docbox API (No explicit port - using default HTTPS 443)');
    console.log('='.repeat(70));
    console.log(`Base URL: ${baseUrl}`);
    console.log(`API URL: ${baseUrl}/api/v2`);
    console.log(`API Key: ${apiKey?.substring(0, 8)}...`);
    console.log(`Cloud ID: ${cloudId || '(not set)'}`);
    console.log('');

    if (!apiKey) {
        console.error('❌ Error: DOCBOX_API_KEY not set');
        process.exit(1);
    }

    const testUrl = `${baseUrl}/api/v2/archivestructure`;
    console.log(`🌐 Testing: ${testUrl}`);
    console.log('');

    try {
        const headers: Record<string, string> = {
            'API-Key': apiKey,
            'Accept': 'application/json'
        };

        if (cloudId) {
            headers['Cloud-ID'] = cloudId;
            console.log('✅ Cloud-ID header included');
        }

        const response = await fetch(testUrl, {
            method: 'GET',
            headers
        });

        console.log(`\n✅ Response Status: ${response.status} ${response.statusText}`);
        console.log(`📋 Response Headers:`);
        response.headers.forEach((value, key) => {
            console.log(`   ${key}: ${value}`);
        });

        if (response.ok) {
            const data = await response.json();
            console.log('\n📦 Response Data:');
            console.log(JSON.stringify(data, null, 2));
            console.log('\n✅ Connection successful!');
            console.log('\nℹ️  The API works WITHOUT specifying port 8081');
            console.log('   Update your .env: remove DOCBOX_PORT or set it to 443');
        } else {
            const errorText = await response.text();
            console.log(`\n❌ Error Response (${response.status}): ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error:', error);

        if (error instanceof Error && 'cause' in error) {
            console.error('Cause:', error.cause);
        }
        process.exit(1);
    }
}

testNoPort();
