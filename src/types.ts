/**
 * Docbox API Types
 * Type definitions for all API requests and responses
 */

/**
 * Proxy authentication credentials
 */
export interface ProxyAuth {
    /** Proxy username */
    username: string;
    /** Proxy password */
    password: string;
}

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
    /** Proxy host (e.g., '10.0.0.1' or 'proxy.company.com') */
    proxyHost?: string;
    /** Proxy port (e.g., 8080, 3128) */
    proxyPort?: number;
    /** Proxy protocol (default: 'http') */
    proxyProtocol?: 'http' | 'https';
    /** Proxy authentication credentials */
    proxyAuth?: ProxyAuth;
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
 * Search options for searching documents
 */
export interface SearchOptions {
    /** Number of results per page (1-100, default: 10) */
    paginationSize?: number;
    /** Page number (0-indexed, default: 0) */
    paginationPage?: number;
    /** Fulltext search - all terms must appear on each page */
    fulltextAll?: string;
    /** Fulltext search - at least one term must appear */
    fulltextOne?: string;
    /** Fulltext search - none of these terms may appear */
    fulltextNone?: string;
    /** Search only for pages created after this date */
    fromDate?: string | Date;
    /** Search only for pages created before this date */
    toDate?: string | Date;
    /** Terms that must appear in follow-up texts */
    followupTerms?: string;
    /** Terms that must appear in notes */
    noteTerms?: string;
    /** Terms that must appear in keywords */
    keywordTerms?: string;
    /** Stamps that must all appear on a page */
    stampsInclusive?: string;
    /** Stamps that must not appear on a page */
    stampsExclusive?: string;
    /** Terms that must appear in document name */
    documentNameTerms?: string;
    /** Terms that must appear in folder path */
    folderNameTerms?: string;
    /** Restrict search to this folder path */
    location?: string;
    /** Restrict search to this folder ID */
    locationFolderId?: number;
    /** Search recursively in subfolders (default: true) */
    recursive?: boolean;
    /** User ID who archived the pages */
    archiverId?: number;
    /** Workflow name */
    workflowName?: string;
    /** Workflow state */
    workflowState?: string;
    /** Document type */
    documentType?: string;
    /** Include documents in trash (default: false) */
    includeTrash?: boolean;
    /** External ID to search for */
    externalId?: string;
    /** External metadata to search for */
    externalMetadata?: string;
}

/**
 * Search result page information
 */
export interface SearchPageInfo {
    id: number;
    hit: boolean;
}

/**
 * Search result document
 */
export interface SearchDocument {
    id: number;
    name: string;
    folderId: number;
    folderPath?: string;
    creationDate?: string;
    pages?: SearchPageInfo[];
}

/**
 * Search response
 */
export interface SearchResponse {
    documents: SearchDocument[];
    totalHits: number;
    totalPages: number;
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
