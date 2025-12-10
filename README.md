# Docbox API Client

A simple, clean, modern TypeScript client for the [Docbox](https://docbox.eu) API.

## Features

✨ **Simple & Intuitive** - Clean, easy-to-use API
🔒 **Type-Safe** - Full TypeScript support with comprehensive types
📦 **Lightweight** - Minimal dependencies
🚀 **Modern** - Uses async/await and ES2020+
🌐 **Proxy Support** - Works behind corporate firewalls with HTTP/HTTPS proxy support
📖 **Well Documented** - JSDoc comments and examples

## Installation

```bash
npm install @treppenhaus/docbox-api
```

## Quick Start

```typescript
import { DocboxClient } from '@treppenhaus/docbox-api';

// Initialize the client
const docbox = new DocboxClient({
  baseUrl: 'https://api.docbox.eu',
  apiKey: 'your-api-key',
  cloudId: 'your-cloud-id' // Optional, required for cloud version
});

// Get archive structure
const archive = await docbox.getArchiveStructure();
console.log(archive.folders);

// List documents in a folder
const documents = await docbox.listDocuments({ 
  folderId: 123,
  subfoldersRecursive: true 
});

// Upload a file
import { readFileSync } from 'fs';
const fileBuffer = readFileSync('invoice.pdf');

const result = await docbox.uploadFile({
  fileData: fileBuffer,
  fileName: 'invoice.pdf',
  targetFolderId: 123,
  keywords: ['invoice', '2024'],
  documentTypes: ['Invoice']
});
```

## Configuration

### DocboxConfig

```typescript
interface DocboxConfig {
  /** Base URL of the Docbox instance (e.g., 'https://api.docbox.eu') */
  baseUrl: string;
  
  /** API key for authentication */
  apiKey: string;
  
  /** Cloud ID (required for cloud version) */
  cloudId?: string;
  
  /** Optional basic auth username */
  username?: string;
  
  /** Optional basic auth password */
  password?: string;
  
  /** API port (default: 8081) */
  port?: number;
  
  /** Proxy host (e.g., '10.0.0.1' or 'proxy.company.com') */
  proxyHost?: string;
  
  /** Proxy port (e.g., 8080, 3128) */
  proxyPort?: number;
  
  /** Proxy protocol (default: 'http') */
  proxyProtocol?: 'http' | 'https';
  
  /** Proxy authentication credentials */
  proxyAuth?: {
    username: string;
    password: string;
  };
}
```

### Using a Proxy

If you're behind a corporate firewall or need to route requests through a proxy:

```typescript
// Simple proxy without authentication
const docbox = new DocboxClient({
  baseUrl: 'https://api.docbox.eu',
  apiKey: 'your-api-key',
  cloudId: 'your-cloud-id',
  proxyHost: '10.0.0.1',
  proxyPort: 8080,
  proxyProtocol: 'http'
});

// Proxy with authentication
const docbox = new DocboxClient({
  baseUrl: 'https://api.docbox.eu',
  apiKey: 'your-api-key',
  cloudId: 'your-cloud-id',
  proxyHost: 'proxy.company.com',
  proxyPort: 3128,
  proxyAuth: {
    username: 'proxyuser',
    password: 'proxypass'
  }
});
```

## API Methods

### `getArchiveStructure(options?)`

Retrieves the folder structure of the Docbox archive.

```typescript
// Get entire archive structure
const archive = await docbox.getArchiveStructure();

// Get structure for a specific folder
const subfolder = await docbox.getArchiveStructure({ 
  parentFolderId: 123 
});
```

### `listDocuments(options)`

Lists documents within a specific folder.

```typescript
const documents = await docbox.listDocuments({
  folderId: 123,
  includedMetadataKeys: 'invoice_number,customer_name',
  excludedMetadataKeys: 'internal_notes',
  withAutoexportStatus: true,
  filterDateCreatedAfter: new Date('2024-01-01'),
  subfoldersRecursive: true
});
```

**Options:**
- `folderId` (required): Folder ID to list documents from
- `includedMetadataKeys`: Comma-separated metadata keys to include
- `excludedMetadataKeys`: Comma-separated metadata keys to exclude
- `withAutoexportStatus`: Include autoexport status
- `filterDateCreatedAfter`: Filter by creation date
- `subfoldersRecursive`: Include documents from subfolders

### `uploadFile(options)`

Uploads a file to Docbox.

```typescript
import { readFileSync } from 'fs';

const fileBuffer = readFileSync('document.pdf');

const result = await docbox.uploadFile({
  fileData: fileBuffer,
  fileName: 'document.pdf',
  targetFolderId: 123,
  targetDocumentName: 'Important Document',
  keywords: ['contract', 'legal'],
  documentTypes: ['Contract'],
  externalId: 'EXT-12345',
  externalMetadata: {
    customer_id: '789',
    invoice_number: 'INV-2024-001'
  },
  forceNewDocument: false
});
```

**Options:**
- `fileData` (required): Buffer or Blob containing the file
- `fileName` (required): Original filename
- `targetMandatorName`: Target mandator name
- `targetFolderPath`: Target folder path
- `targetFolderId`: Target folder ID
- `targetDocumentName`: Name for the document
- `keywords`: Array of keywords
- `documentTypes`: Array of document types
- `externalId`: External system identifier
- `externalMetadata`: Key-value pairs of metadata
- `emailImportOrder`: Email import order
- `forceNewDocument`: Force creation of new document

### `createFolder(options)`

Creates a new folder in the archive.

```typescript
// Create folder by parent ID
const result = await docbox.createFolder({
  name: 'Invoices 2024',
  parentFolderId: 123
});

// Create folder by parent path
const result = await docbox.createFolder({
  name: 'New Folder',
  parentFolderPath: '/Documents/Archives'
});
```

**Options:**
- `name` (required): Name of the folder
- `parentFolderId`: Parent folder ID
- `parentFolderPath`: Parent folder path

### `listInboxes()`

Returns the list of inbox folders.

```typescript
const inboxes = await docbox.listInboxes();
console.log(inboxes.inboxes);
```

## Error Handling

The library throws `DocboxError` for API errors:

```typescript
import { DocboxClient, DocboxError } from '@treppenhaus/docbox-api';

try {
  const result = await docbox.uploadFile({
    fileData: buffer,
    fileName: 'test.pdf',
    targetFolderId: 999
  });
} catch (error) {
  if (error instanceof DocboxError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Response:', error.responseBody);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## TypeScript Support

The library is written in TypeScript and includes comprehensive type definitions:

```typescript
import { 
  DocboxClient, 
  Document, 
  Folder,
  FileUploadOptions,
  DocumentListOptions 
} from '@treppenhaus/docbox-api';

const docbox = new DocboxClient({
  baseUrl: 'https://api.docbox.eu',
  apiKey: 'your-key'
});

// Types are inferred automatically
const documents = await docbox.listDocuments({ folderId: 123 });
documents.documents.forEach((doc: Document) => {
  console.log(doc.name, doc.keywords);
});
```

## Browser Usage

While this library is primarily designed for Node.js, it can be used in browsers with a bundler like Webpack or Vite. Note that you'll need to handle CORS appropriately on the Docbox server side.

## License

MIT

## API Documentation

For more information about the Docbox API, see the [official documentation](https://wiki.docbox.eu/media/wiki/api/version-7-1.html).
