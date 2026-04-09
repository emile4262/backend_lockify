import { typeDocument } from 'src/schema/documents.schema'

export class UploadDocumentCommand {
  constructor(
    public readonly userId: string,
    public readonly fileName: string,
    public readonly mimeType: string,
    public readonly fileSizeBytes: number,
    public readonly fileBuffer: Buffer,
    public readonly typeDocument: typeDocument,
    public readonly expiresAt: Date | null,
  ) {}
}