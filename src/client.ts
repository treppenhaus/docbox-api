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

        // Create axios instance
        this.axiosInstance = axios.create({
            baseURL: this.baseApiUrl,
            timeout: 30000,
            headers: this.getHeaders()
        });
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
}
