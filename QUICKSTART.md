# Quick Start Guide

This guide will help you get started with the Docbox API client quickly.

## Installation

```bash
npm install @treppenhaus/docbox-api
```

## Basic Setup

```typescript
import { DocboxClient } from '@treppenhaus/docbox-api';

const docbox = new DocboxClient({
  baseUrl: 'https://api.docbox.eu',
  apiKey: 'your-api-key-here',
  cloudId: 'your-cloud-id' // Only if using cloud version
});
```

## Common Tasks

### 1. Browse the Archive

```typescript
// Get all folders in the archive
const archive = await docbox.getArchiveStructure();

// Display folder names
archive.folders.forEach(folder => {
  console.log(`Folder: ${folder.name} (ID: ${folder.id})`);
});
```

### 2. Search for Documents

```typescript
// Find all documents in a specific folder
const docs = await docbox.listDocuments({
  folderId: 123,
  subfoldersRecursive: true
});

console.log(`Found ${docs.documents.length} documents`);
```

### 3. Upload Documents

```typescript
import { readFileSync } from 'fs';

// Read file
const fileBuffer = readFileSync('path/to/invoice.pdf');

// Upload to Docbox
const result = await docbox.uploadFile({
  fileData: fileBuffer,
  fileName: 'invoice.pdf',
  targetFolderId: 123,
  keywords: ['invoice', 'important'],
  externalMetadata: {
    invoice_number: 'INV-2024-001',
    customer: 'ACME Corp'
  }
});

console.log('Upload successful!', result);
```

### 4. Organize Documents

```typescript
// Create a new folder
const newFolder = await docbox.createFolder({
  name: 'Invoices 2024',
  parentFolderId: 123
});

console.log('Created folder:', newFolder.folderId);
```

### 5. List Inboxes

```typescript
// Get all inbox folders
const inboxes = await docbox.listInboxes();

inboxes.inboxes.forEach(inbox => {
  console.log(`Inbox: ${inbox.name}`);
});
```

## Error Handling

Always wrap your API calls in try-catch blocks:

```typescript
import { DocboxError } from '@treppenhaus/docbox-api';

try {
  const docs = await docbox.listDocuments({ folderId: 123 });
  // Process documents...
} catch (error) {
  if (error instanceof DocboxError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.statusCode);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Environment Variables

For production use, store credentials in environment variables:

```typescript
const docbox = new DocboxClient({
  baseUrl: process.env.DOCBOX_BASE_URL || 'https://api.docbox.eu',
  apiKey: process.env.DOCBOX_API_KEY!,
  cloudId: process.env.DOCBOX_CLOUD_ID
});
```

Create a `.env` file:

```
DOCBOX_BASE_URL=https://api.docbox.eu
DOCBOX_API_KEY=your-api-key-here
DOCBOX_CLOUD_ID=your-cloud-id
```

## TypeScript Benefits

The library provides full type safety:

```typescript
import { Document, Folder } from '@treppenhaus/docbox-api';

const docs = await docbox.listDocuments({ folderId: 123 });

// TypeScript knows the structure!
docs.documents.forEach((doc: Document) => {
  console.log(doc.name); // ✅ Type-safe
  console.log(doc.keywords); // ✅ Type-safe
  // console.log(doc.invalid); // ❌ TypeScript error
});
```

## Next Steps

- Read the full [README.md](./README.md) for detailed API documentation
- Check out [example.ts](./example.ts) for more usage examples
- Visit the [Docbox API Documentation](https://wiki.docbox.eu/media/wiki/api/version-7-1.html) for details

## Support

For issues or questions:
- Check the [Docbox Documentation](https://wiki.docbox.eu/media/wiki/api/version-7-1.html)
- Review the examples in this repository
- Contact Docbox support for API-specific questions
