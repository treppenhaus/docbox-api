# Docbox API Client - Project Summary

## Overview
A simple, clean, modern TypeScript client for the Docbox API v2.

## Project Structure

```
docbox-api/
├── src/                    # Source TypeScript files
│   ├── client.ts          # Main DocboxClient class
│   ├── types.ts           # TypeScript type definitions
│   └── index.ts           # Main entry point
├── dist/                   # Compiled JavaScript & type definitions
│   ├── client.js
│   ├── client.d.ts
│   ├── types.js
│   ├── types.d.ts
│   ├── index.js
│   └── index.d.ts
├── package.json           # NPM package configuration
├── tsconfig.json          # TypeScript configuration
├── README.md              # Full documentation
├── QUICKSTART.md          # Quick start guide
├── CHANGELOG.md           # Version history
├── LICENSE                # MIT license
├── example.ts             # Usage examples
└── .gitignore            # Git ignore rules
```

## Features

### ✨ Core Features
- **Simple API**: Clean, intuitive methods for all Docbox operations
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Modern**: Uses async/await and ES2020+ features
- **Lightweight**: Minimal dependencies (only form-data)
- **Well-Documented**: JSDoc comments and extensive examples

### 🔌 Supported Endpoints

1. **Archive Structure** (`getArchiveStructure`)
   - Retrieve folder hierarchy
   - Filter by parent folder

2. **Document List** (`listDocuments`)
   - List documents in folders
   - Advanced filtering options
   - Metadata inclusion/exclusion
   - Date filtering
   - Recursive subfolder search

3. **File Upload** (`uploadFile`)
   - Upload files with metadata
   - Set keywords and document types
   - External metadata support
   - Target folder/path specification

4. **Folder Creation** (`createFolder`)
   - Create new folders
   - Specify parent by ID or path

5. **Inbox List** (`listInboxes`)
   - Retrieve inbox folders

### 🔒 Authentication
- API Key authentication
- Basic HTTP authentication (optional)
- Cloud ID support for cloud version
- Custom port configuration

### 🎯 Error Handling
- Custom `DocboxError` class
- Status codes and response bodies
- Network error handling
- Type-safe error checking

## Usage Example

```typescript
import { DocboxClient } from '@treppenhaus/docbox-api';

const docbox = new DocboxClient({
  baseUrl: 'https://api.docbox.eu',
  apiKey: 'your-api-key',
  cloudId: 'your-cloud-id' // optional
});

// Get archive structure
const archive = await docbox.getArchiveStructure();

// List documents
const docs = await docbox.listDocuments({ 
  folderId: 123,
  subfoldersRecursive: true 
});

// Upload file
const result = await docbox.uploadFile({
  fileData: buffer,
  fileName: 'invoice.pdf',
  targetFolderId: 123,
  keywords: ['invoice', '2024']
});
```

## Type Definitions

All request and response types are fully typed:

- `DocboxConfig` - Client configuration
- `ArchiveStructure` & `Folder` - Archive structure
- `Document` & `DocumentListResponse` - Document data
- `FileUploadOptions` & `FileUploadResponse` - File uploads
- `FolderCreateOptions` & `FolderCreateResponse` - Folder creation
- `Inbox` & `InboxListResponse` - Inbox folders
- `DocboxError` - Error handling

## Getting Started

1. **Install**: `npm install @treppenhaus/docbox-api`
2. **Import**: `import { DocboxClient } from '@treppenhaus/docbox-api'`
3. **Configure**: Create client with your credentials
4. **Use**: Call API methods with full TypeScript support

## Documentation

- **README.md**: Comprehensive API documentation
- **QUICKSTART.md**: Quick start guide with common tasks
- **example.ts**: Practical usage examples
- **CHANGELOG.md**: Version history

## Technology Stack

- **Language**: TypeScript 5.3+
- **Runtime**: Node.js (ES2020+)
- **Dependencies**: 
  - `form-data` (for multipart file uploads)
  - `@types/node` (dev dependency)
- **Build**: TypeScript Compiler (tsc)

## API Reference

Based on Docbox API v2 (Version 7.1)
- Base URL: `{docbox-host}:{api-port}/api/v2`
- Default Port: 8081
- Authentication: API-Key header (+ optional Basic auth)
- Documentation: https://wiki.docbox.eu/media/wiki/api/version-7-1.html

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run dev

# Run examples
npx tsx example.ts
```

## License

MIT License - see LICENSE file for details

## Version

Current version: 1.0.0
Release date: 2024-12-08
