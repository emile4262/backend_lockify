import { DocumentCategory, DocumentDocument } from "src/common/schema/documents.schema"
import { DocumentResponseDto } from "../dto/document.response.dto"

export interface IDocumentInterface {
  create(data: {
    ownerId: string
    fileName: string
    mimeType: string
    fileSizeBytes: number
    storageKey: string
    category: DocumentCategory
    tags: string[]
    expiresAt: Date | null
  }): Promise<DocumentDocument>

  findById(id: string, ownerId: string): Promise<DocumentDocument | null>

  findAll(
    ownerId: string,
    filters: {
      category?: DocumentCategory
      search?: string
      page: number
      pageSize: number
    },
  ): Promise<{ items: DocumentDocument[]; total: number }>

  update(
    id: string,
    ownerId: string,
    data: Partial<{
      fileName: string
      category: DocumentCategory
      tags: string[]
      expiresAt: Date | null
      isFavorite: boolean
    }>,
  ): Promise<DocumentResponseDto | null>

  delete(id: string, ownerId: string): Promise<DocumentResponseDto>

  findExpiringSoon(ownerId: string, withinDays: number): Promise<DocumentDocument[]>
}