import { DocumentCategory } from 'src/common/schema/documents.schema'

export class UploadDocumentCommand {
  constructor(
    public readonly userId: string,
    public readonly fileName: string,
    public readonly mimeType: string,
    public readonly fileSizeBytes: number,
    public readonly storageKey: string,
    public readonly category: DocumentCategory,
    public readonly tags: string[],
    public readonly expiresAt: Date | null,
  ) {}
}