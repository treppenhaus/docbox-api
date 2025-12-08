import {
    DocboxConfig,
    DocboxError,
    ArchiveStructure,
    ArchiveStructureOptions,
    DocumentListResponse,
    DocumentListOptions,
    FileUploadOptions,
    FileUploadResponse,
    FolderCreateOptions,
    FolderCreateResponse,
    InboxListResponse
} from './types';
import FormData from 'form-data';

/**
 * Main Docbox API Client
 * 
 * @example
 * ```typescript
 * const docbox = new DocboxClient({
 *   baseUrl: 'https://api.docbox.eu',
 *   apiKey: 'your-api-key',
 *   cloudId: 'your-cloud-id' // optional, for cloud version
 * });
 * 
 * // Get archive structure
 * const archive = await docbox.getArchiveStructure();
 * 
 * // List documents in a folder
 * const documents = await docbox.listDocuments({ folderId: 123 });
 * 
 * // Upload a file
 * const result = await docbox.uploadFile({
 *   fileData: buffer,
 *   fileName: 'invoice.pdf',
 *   targetFolderId: 123
 * });
 * ```
 */
export class DocboxClient {
    private config: DocboxConfig;
    private baseApiUrl: string;

    constructor(config: DocboxConfig) {
        this.config = {
            ...config
        };

        // Construct base API URL
        const baseUrl = this.config.baseUrl.replace(/\/$/, ''); // Remove trailing slash

        // For cloud.docbox.eu, don't add port (uses default HTTPS 443)
        // For self-hosted, add port if specified
        if (baseUrl.includes('cloud.docbox.eu')) {
            this.baseApiUrl = `${baseUrl}/api/v2`;
        } else {
            const port = this.config.port || 8081;
            this.baseApiUrl = `${baseUrl}:${port}/api/v2`;
        }
    }

    /**
     * Get the authorization headers for API requests
     */
    private getHeaders(includeContentType = true): Record<string, string> {
        const headers: Record<string, string> = {
            'API-Key': this.config.apiKey,
        };

        console.log('[DEBUG] this.config.cloudId:', this.config.cloudId);

        if (this.config.cloudId) {
            headers['Cloud-ID'] = this.config.cloudId;
            console.log('[DEBUG] Cloud-ID header added:', this.config.cloudId);
        }

        if (this.config.username && this.config.password) {
            const auth = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
            headers['Authorization'] = `Basic ${auth}`;
        }

        if (includeContentType) {
            headers['Accept'] = 'application/json';
        }

        return headers;
    }

    /**
     * Make a request to the Docbox API
     */
    private async request<T>(
        method: string,
        endpoint: string,
        options?: {
            params?: Record<string, any>;
            body?: any;
            headers?: Record<string, string>;
        }
    ): Promise<T> {
        const url = new URL(`${this.baseApiUrl}${endpoint}`);

        console.log('[DEBUG] Requesting URL:', url.toString());

        // Add query parameters
        if (options?.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        const headers = {
            ...this.getHeaders(),
            ...options?.headers
        };

        console.log('[DEBUG] Request headers:', JSON.stringify(headers, null, 2));

        const fetchOptions: RequestInit = {
            method,
            headers,
        };

        if (options?.body) {
            if (options.body instanceof FormData) {
                // Let fetch set the content-type for FormData (it needs to include boundary)
                delete headers['Accept'];
                fetchOptions.body = options.body as any;
            } else {
                fetchOptions.body = JSON.stringify(options.body);
                headers['Content-Type'] = 'application/json';
            }
        }

        try {
            const response = await fetch(url.toString(), fetchOptions);

            if (!response.ok) {
                const errorBody = await response.text();
                throw new DocboxError(
                    `API request failed: ${response.statusText}`,
                    response.status,
                    errorBody
                );
            }

            // Check if response has content
            const contentLength = response.headers.get('content-length');
            if (contentLength === '0' || response.status === 204) {
                return {} as T;
            }

            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return (await response.json()) as T;
            }

            return (await response.text()) as any as T;
        } catch (error) {
            if (error instanceof DocboxError) {
                throw error;
            }
            // Log the actual error for debugging
            console.error('[DEBUG] Fetch error details:', error);
            throw new DocboxError(
                `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                undefined,
                error instanceof Error ? error.stack : undefined
            );
        }
    }

    /**
     * Get the archive structure
     * 
     * @param options - Options for filtering the archive structure
     * @returns The archive folder structure
     * 
     * @example
     * ```typescript
     * // Get entire archive structure
     * const archive = await docbox.getArchiveStructure();
     * 
     * // Get structure for a specific folder
     * const subfolder = await docbox.getArchiveStructure({ parentFolderId: 123 });
     * ```
     */
    async getArchiveStructure(options?: ArchiveStructureOptions): Promise<ArchiveStructure> {
        const params: Record<string, any> = {};

        if (options?.parentFolderId) {
            params['parent-folder-id'] = options.parentFolderId;
        }

        return this.request<ArchiveStructure>('GET', '/archivestructure', { params });
    }

    /**
     * List documents in a folder
     * 
     * @param options - Options for filtering and configuring the document list
     * @returns List of documents
     * 
     * @example
     * ```typescript
     * // List all documents in a folder
     * const docs = await docbox.listDocuments({ folderId: 123 });
     * 
     * // List with metadata filtering
     * const docs = await docbox.listDocuments({
     *   folderId: 123,
     *   includedMetadataKeys: 'invoice_number,customer_name',
     *   subfoldersRecursive: true
     * });
     * ```
     */
    async listDocuments(options: DocumentListOptions): Promise<DocumentListResponse> {
        const params: Record<string, any> = {
            'folder-id': options.folderId
        };

        if (options.includedMetadataKeys) {
            params['included-metadata-keys'] = options.includedMetadataKeys;
        }

        if (options.excludedMetadataKeys) {
            params['excluded-matadata-keys'] = options.excludedMetadataKeys;
        }

        if (options.withAutoexportStatus !== undefined) {
            params['with-autoexport-status'] = options.withAutoexportStatus;
        }

        if (options.filterDateCreatedAfter) {
            const date = options.filterDateCreatedAfter instanceof Date
                ? options.filterDateCreatedAfter.toISOString().split('T')[0]
                : options.filterDateCreatedAfter;
            params['filter-date-created-after'] = date;
        }

        if (options.subfoldersRecursive !== undefined) {
            params['subfolders-recursive'] = options.subfoldersRecursive;
        }

        return this.request<DocumentListResponse>('GET', '/document/list', { params });
    }

    /**
     * Upload a file to Docbox
     * 
     * @param options - File upload options
     * @returns Upload result
     * 
     * @example
     * ```typescript
     * import { readFileSync } from 'fs';
     * 
     * const fileBuffer = readFileSync('invoice.pdf');
     * const result = await docbox.uploadFile({
     *   fileData: fileBuffer,
     *   fileName: 'invoice.pdf',
     *   targetFolderId: 123,
     *   keywords: ['invoice', '2024'],
     *   documentTypes: ['Invoice']
     * });
     * ```
     */
    async uploadFile(options: FileUploadOptions): Promise<FileUploadResponse> {
        const formData = new FormData();

        formData.append('uploadData', options.fileData, options.fileName);

        if (options.targetMandatorName) {
            formData.append('targetMandatorName', options.targetMandatorName);
        }

        if (options.targetFolderPath) {
            formData.append('targetFolderPath', options.targetFolderPath);
        }

        if (options.targetFolderId) {
            formData.append('targetFolderId', options.targetFolderId.toString());
        }

        if (options.targetDocumentName) {
            formData.append('targetDocumentName', options.targetDocumentName);
        }

        if (options.keywords && options.keywords.length > 0) {
            formData.append('keywords', options.keywords.join(','));
        }

        if (options.documentTypes && options.documentTypes.length > 0) {
            formData.append('documentTypes', options.documentTypes.join(','));
        }

        if (options.externalId) {
            formData.append('externalId', options.externalId);
        }

        if (options.externalMetadata) {
            formData.append('externalMetadatas', JSON.stringify(options.externalMetadata));
        }

        if (options.emailImportOrder) {
            formData.append('emailImportOrder', options.emailImportOrder);
        }

        if (options.forceNewDocument !== undefined) {
            formData.append('forceNewDocument', options.forceNewDocument.toString());
        }

        return this.request<FileUploadResponse>('POST', '/file-upload', {
            body: formData,
            headers: formData.getHeaders()
        });
    }

    /**
     * Create a new folder
     * 
     * @param options - Folder creation options
     * @returns Creation result
     * 
     * @example
     * ```typescript
     * // Create folder by parent ID
     * const result = await docbox.createFolder({
     *   name: 'Invoices 2024',
     *   parentFolderId: 123
     * });
     * 
     * // Create folder by parent path
     * const result = await docbox.createFolder({
     *   name: 'New Folder',
     *   parentFolderPath: '/Documents/Archives'
     * });
     * ```
     */
    async createFolder(options: FolderCreateOptions): Promise<FolderCreateResponse> {
        const body: Record<string, any> = {
            name: options.name
        };

        if (options.parentFolderId) {
            body.parentFolderId = options.parentFolderId;
        }

        if (options.parentFolderPath) {
            body.parentFolderPath = options.parentFolderPath;
        }

        return this.request<FolderCreateResponse>('POST', '/folder/create', { body });
    }

    /**
     * Get list of inbox folders
     * 
     * @returns List of inbox folders
     * 
     * @example
     * ```typescript
     * const inboxes = await docbox.listInboxes();
     * console.log(inboxes.inboxes);
     * ```
     */
    async listInboxes(): Promise<InboxListResponse> {
        return this.request<InboxListResponse>('GET', '/inboxes');
    }
}
