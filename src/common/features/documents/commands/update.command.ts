import { DocumentCategory } from 'src/common/schema/documents.schema'

export class UpdateDocumentCommand {
  constructor(
    public readonly documentId: string,
    public readonly userId: string,
    public readonly fileName?: string,
    public readonly category?: DocumentCategory,
    public readonly tags?: string[],
    public readonly expiresAt?: Date | null,
    public readonly isFavorite?: boolean,
  ) {}
}