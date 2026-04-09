import { typeDocument } from 'src/schema/documents.schema'

export class DocumentResponseDto {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly fileName: string,
    public readonly fileType: string,
    public readonly fileSizeBytes: number,
    public readonly pdfUrl: string,
    public readonly typeDocument: typeDocument,
    public readonly tags: string[],
    public readonly expiresAt: string | null,
    public readonly isFavorite: boolean,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  static fromDocument(doc: any): DocumentResponseDto {
    return new DocumentResponseDto(
      doc._id.toString(),
      doc.userId.toString(),
      doc.fileName,
      doc.fileType,
      doc.fileSizeBytes,
      doc.pdfUrl,
      doc.typeDocument,
      doc.tags ?? [],
      doc.expiresAt ? new Date(doc.expiresAt).toISOString() : null,
      doc.isFavorite ?? false,
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt,
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : doc.updatedAt,
    )
  }
}

// export class DocumentListResponseDto {
//   constructor(
//     public readonly items: DocumentResponseDto[],
//     public readonly total: number,
//     public readonly page: number,
//     public readonly pageSize: number,
//   ) {}
// }