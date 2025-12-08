/**
 * Docbox API Types
 * Type definitions for all API requests and responses
 */

/**
 * Configuration options for the Docbox API client
 */
export interface DocboxConfig {
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
}

/**
 * Folder in the archive structure
 */
export interface Folder {
    id: number;
    name: string;
    parentId?: number;
    path?: string;
    subfolders?: Folder[];
}

/**
 * Archive structure response
 */
export interface ArchiveStructure {
    folders: Folder[];
}

/**
 * Document metadata
 */
export interface Document {
    id: number;
    name: string;
    folderId: number;
    folderPath?: string;
    createdAt?: string;
    modifiedAt?: string;
    keywords?: string[];
    documentTypes?: string[];
    externalId?: string;
    metadata?: Record<string, any>;
    autoexportStatus?: string;
}

/**
 * Document list response
 */
export interface DocumentListResponse {
    documents: Document[];
    total?: number;
}

/**
 * Inbox folder
 */
export interface Inbox {
    id: number;
    name: string;
    path?: string;
}

/**
 * Inbox list response
 */
export interface InboxListResponse {
    inboxes: Inbox[];
}

/**
 * File upload options
 */
export interface FileUploadOptions {
    /** The file data to upload (Buffer or File) */
    fileData: Buffer | Blob;
    /** Original filename */
    fileName: string;
    /** Target mandator name */
    targetMandatorName?: string;
    /** Target folder path */
    targetFolderPath?: string;
    /** Target folder ID */
    targetFolderId?: number;
    /** Target document name */
    targetDocumentName?: string;
    /** Keywords for the document */
    keywords?: string[];
    /** Document types */
    documentTypes?: string[];
    /** External ID */
    externalId?: string;
    /** External metadata as key-value pairs */
    externalMetadata?: Record<string, string>;
    /** Email import order */
    emailImportOrder?: string;
    /** Force creation of new document */
    forceNewDocument?: boolean;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
    success: boolean;
    documentId?: number;
    message?: string;
}

/**
 * Folder create options
 */
export interface FolderCreateOptions {
    /** Name of the folder to create */
    name: string;
    /** Parent folder ID */
    parentFolderId?: number;
    /** Parent folder path */
    parentFolderPath?: string;
}

/**
 * Folder create response
 */
export interface FolderCreateResponse {
    success: boolean;
    folderId?: number;
    message?: string;
}

/**
 * Document list query options
 */
export interface DocumentListOptions {
    /** Folder ID to list documents from */
    folderId: number;
    /** Comma-separated metadata keys to include */
    includedMetadataKeys?: string;
    /** Comma-separated metadata keys to exclude */
    excludedMetadataKeys?: string;
    /** Include autoexport status */
    withAutoexportStatus?: boolean;
    /** Filter by creation date (documents created after this date) */
    filterDateCreatedAfter?: Date | string;
    /** Include documents from subfolders recursively */
    subfoldersRecursive?: boolean;
}

/**
 * Archive structure query options
 */
export interface ArchiveStructureOptions {
    /** Parent folder ID. If omitted, the whole archive is returned */
    parentFolderId?: number;
}

/**
 * API Error
 */
export class DocboxError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public responseBody?: any
    ) {
        super(message);
        this.name = 'DocboxError';
    }
}
