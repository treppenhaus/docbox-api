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
    InboxListResponse,
    SearchOptions,
    SearchResponse
} from './types';
import FormData from 'form-data';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Main Docbox API Client
 * 
 * @example
 * ```typescript
 * const docbox = new DocboxClient({
 *   baseUrl: 'https://cloud.docbox.eu:8081',
 *   apiKey: 'your-api-key',
 *   cloudId: 'your-cloud-id' // required for cloud version
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
    private axiosInstance: AxiosInstance;

    constructor(config: DocboxConfig) {
        this.config = { ...config };

        // Construct base API URL
        const baseUrl = this.config.baseUrl.replace(/\/$/, '');

        // Check if port is already in the base URL (e.g., https://cloud.docbox.eu:8081)
        const hasPort = baseUrl.match(/:\d+$/);

        if (hasPort) {
            this.baseApiUrl = `${baseUrl}/api/v2`;
        } else if (this.config.port) {
            this.baseApiUrl = `${baseUrl}:${this.config.port}/api/v2`;
        } else {
            this.baseApiUrl = `${baseUrl}/api/v2`;
        }

        // Create axios instance with proxy support
        const axiosConfig: AxiosRequestConfig = {
            baseURL: this.baseApiUrl,
            timeout: 30000,
            headers: this.getHeaders()
        };

        // Configure proxy if provided
        if (this.config.proxyHost) {
            const proxyProtocol = this.config.proxyProtocol || 'http';
            const proxyPort = this.config.proxyPort || 8080;

            axiosConfig.proxy = {
                protocol: proxyProtocol,
                host: this.config.proxyHost,
                port: proxyPort
            };

            // Add proxy authentication if provided
            if (this.config.proxyAuth) {
                axiosConfig.proxy.auth = {
                    username: this.config.proxyAuth.username,
                    password: this.config.proxyAuth.password
                };
            }
        }

        this.axiosInstance = axios.create(axiosConfig);
    }

    /**
     * Get the authorization headers for API requests
     */
    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'API-Key': this.config.apiKey,
            'Accept': 'application/json'
        };

        if (this.config.cloudId) {
            headers['Cloud-ID'] = this.config.cloudId;
        }

        if (this.config.username && this.config.password) {
            const auth = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
            headers['Authorization'] = `Basic ${auth}`;
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
            data?: any;
            headers?: Record<string, string>;
        }
    ): Promise<T> {
        try {
            const config: AxiosRequestConfig = {
                method,
                url: endpoint,
                params: options?.params,
                data: options?.data,
                headers: {
                    ...this.getHeaders(),
                    ...options?.headers
                }
            };

            const response = await this.axiosInstance.request<T>(config);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new DocboxError(
                    error.response?.data?.message || error.message,
                    error.response?.status,
                    error.response?.data
                );
            }
            throw new DocboxError(
                error instanceof Error ? error.message : 'Unknown error',
                undefined,
                error
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
            params['excluded-metadata-keys'] = options.excludedMetadataKeys;
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
            data: formData,
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
        const data: Record<string, any> = {
            name: options.name
        };

        if (options.parentFolderId) {
            data.parentFolderId = options.parentFolderId;
        }

        if (options.parentFolderPath) {
            data.parentFolderPath = options.parentFolderPath;
        }

        return this.request<FolderCreateResponse>('POST', '/folder/create', { data });
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

    /**
     * Search for documents
     * 
     * @param options - Search options
     * @returns Search results
     * 
     * @example
     * ```typescript
     * // Search by document name
     * const results = await docbox.search({
     *   documentNameTerms: 'urlaubsantrag',
     *   paginationSize: 20
     * });
     * 
     * // Full-text search
     * const results = await docbox.search({
     *   fulltextAll: 'invoice payment',
     *   fromDate: '2024-01-01'
     * });
     * 
     * // Search in specific folder
     * const results = await docbox.search({
     *   locationFolderId: 123,
     *   recursive: true
     * });
     * ```
     */
    async search(options: SearchOptions = {}): Promise<SearchResponse> {
        const params: Record<string, any> = {};

        if (options.paginationSize !== undefined) {
            params['pagination-size'] = options.paginationSize;
        }

        if (options.paginationPage !== undefined) {
            params['pagination-page'] = options.paginationPage;
        }

        if (options.fulltextAll) {
            params['fulltext-all'] = options.fulltextAll;
        }

        if (options.fulltextOne) {
            params['fulltext-one'] = options.fulltextOne;
        }

        if (options.fulltextNone) {
            params['fulltext-none'] = options.fulltextNone;
        }

        if (options.fromDate) {
            const date = options.fromDate instanceof Date
                ? options.fromDate.toISOString().split('T')[0]
                : options.fromDate;
            params['from-date'] = date;
        }

        if (options.toDate) {
            const date = options.toDate instanceof Date
                ? options.toDate.toISOString().split('T')[0]
                : options.toDate;
            params['to-date'] = date;
        }

        if (options.followupTerms) {
            params['followup-terms'] = options.followupTerms;
        }

        if (options.noteTerms) {
            params['note-terms'] = options.noteTerms;
        }

        if (options.keywordTerms) {
            params['keyword-terms'] = options.keywordTerms;
        }

        if (options.stampsInclusive) {
            params['stamps-inclusive'] = options.stampsInclusive;
        }

        if (options.stampsExclusive) {
            params['stamps-exclusive'] = options.stampsExclusive;
        }

        if (options.documentNameTerms) {
            params['document-name-terms'] = options.documentNameTerms;
        }

        if (options.folderNameTerms) {
            params['folder-name-terms'] = options.folderNameTerms;
        }

        if (options.location) {
            params['location'] = options.location;
        }

        if (options.locationFolderId !== undefined) {
            params['location-folder-id'] = options.locationFolderId;
        }

        if (options.recursive !== undefined) {
            params['recursive'] = options.recursive;
        }

        if (options.archiverId !== undefined) {
            params['archiver-id'] = options.archiverId;
        }

        if (options.workflowName) {
            params['workflow-name'] = options.workflowName;
        }

        if (options.workflowState) {
            params['workflow-state'] = options.workflowState;
        }

        if (options.documentType) {
            params['document-type'] = options.documentType;
        }

        if (options.includeTrash !== undefined) {
            params['include-trash'] = options.includeTrash;
        }

        if (options.externalId) {
            params['external-id'] = options.externalId;
        }

        if (options.externalMetadata) {
            params['external-metadata'] = options.externalMetadata;
        }

        return this.request<SearchResponse>('POST', '/search', { params });
    }
}
