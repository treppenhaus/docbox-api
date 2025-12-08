/**
 * Simple connection test for Docbox API
 * Use this to verify your Docbox instance is accessible
 */

import 'dotenv/config';

async function testConnection() {
    const baseUrl = process.env.DOCBOX_BASE_URL || 'https://api.docbox.eu';
    const apiKey = process.env.DOCBOX_API_KEY;
    const cloudId = process.env.DOCBOX_CLOUD_ID;

    console.log('🔍 Testing Docbox API Connection');
    console.log('================================');
    console.log(`Base URL: ${baseUrl}`);
    console.log(`API Key: ${apiKey?.substring(0, 8)}...`);
    if (cloudId) {
        console.log(`Cloud ID: ${cloudId}`);
    }
    console.log('');

    if (!apiKey) {
        console.error('❌ Error: DOCBOX_API_KEY not set');
        process.exit(1);
    }

    const testUrl = `${baseUrl}/api/v2/archivestructure`;
    console.log(`🌐 Testing connection to: ${testUrl}`);
    console.log('');

    try {
        const headers: Record<string, string> = {
            'API-Key': apiKey,
            'Accept': 'application/json'
        };

        if (cloudId) {
            headers['Cloud-ID'] = cloudId;
        }

        const response = await fetch(testUrl, {
            method: 'GET',
            headers
        });

        console.log(`✅ Response Status: ${response.status} ${response.statusText}`);
        console.log(`📋 Response Headers:`);
        response.headers.forEach((value, key) => {
            console.log(`   ${key}: ${value}`);
        });

        if (response.ok) {
            const data = await response.json();
            console.log('\n📦 Response Data:');
            console.log(JSON.stringify(data, null, 2));
            console.log('\n✅ Connection successful!');
        } else {
            const errorText = await response.text();
            console.log(`\n❌ Error Response: ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error details:', error);

        if (error instanceof Error && 'cause' in error) {
            console.error('Root cause:', error.cause);
        }

        console.log('\n💡 Common issues:');
        console.log('   1. Check if DOCBOX_BASE_URL is correct (should be your Docbox server hostname)');
        console.log('   2. Verify the port (default is 8081)');
        console.log('   3. Ensure your Docbox instance is running and accessible');
        console.log('   4. Check firewall/network settings');
        console.log('   5. For cloud version, you might need to add DOCBOX_CLOUD_ID');

        process.exit(1);
    }
}

testConnection();
