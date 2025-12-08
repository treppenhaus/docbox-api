# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-08

### Added
- Initial release of Docbox API client
- Support for all major Docbox API v2 endpoints:
  - `getArchiveStructure()` - Retrieve folder structure
  - `listDocuments()` - List documents with filtering options
  - `uploadFile()` - Upload files with metadata
  - `createFolder()` - Create new folders
  - `listInboxes()` - Get inbox folders
- Full TypeScript support with comprehensive type definitions
- API key and basic authentication support
- Cloud ID support for Docbox cloud version
- Comprehensive error handling with `DocboxError` class
- JSDoc documentation for all public methods
- Form-data support for file uploads
- Query parameter handling for all GET requests
- README with detailed usage examples
- Quick start guide
- Example file demonstrating all features

### Features
- ✨ Simple, clean API design
- 🔒 Type-safe with full TypeScript support
- 📦 Lightweight with minimal dependencies
- 🚀 Modern async/await patterns
- 📖 Comprehensive documentation

[1.0.0]: https://github.com/treppenhaus/docbox-api/releases/tag/v1.0.0
