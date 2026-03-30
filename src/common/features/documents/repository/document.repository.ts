import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DocumentEntity, DocumentDocument } from 'src/common/schema/documents.schema'
import { DeleteDocumentCommand } from '../commands/delete.command'
import { UpdateDocumentCommand } from '../commands/update.command'
import { UploadDocumentCommand } from '../commands/upload.command'
import { DocumentResponseDto, DocumentListResponseDto } from '../dto/document.response.dto'
import { GetDocumentByIdQuery } from '../query/getOne.document'
import { ListDocumentsQuery } from '../query/list.document'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 Mo

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectModel(DocumentEntity.name)
    private readonly documentModel: Model<DocumentDocument>,
  ) {}

  // ─────────────────────────────────────────────
  // COMMAND — Upload
  // ─────────────────────────────────────────────
  async upload(cmd: UploadDocumentCommand): Promise<DocumentResponseDto> {
    if (!ALLOWED_MIME_TYPES.includes(cmd.mimeType)) {
      throw new BadRequestException('TYPE_FICHIER_NON_SUPPORTE')
    }

    if (cmd.fileSizeBytes > MAX_FILE_SIZE) {
      throw new BadRequestException('FICHIER_TROP_VOLUMINEUX')
    }

    const document = await this.documentModel.create({
      userId:       cmd.userId,
      fileName:      cmd.fileName,
      mimeType:      cmd.mimeType,
      fileSizeBytes: cmd.fileSizeBytes,
      storageKey:    cmd.storageKey,
      category:      cmd.category,
      tags:          cmd.tags,
      expiresAt:     cmd.expiresAt,
    })

    return DocumentResponseDto.fromDocument(document)
  }

  // ─────────────────────────────────────────────
  // COMMAND — Update
  // ─────────────────────────────────────────────
  async update(cmd: UpdateDocumentCommand): Promise<DocumentResponseDto> {
    const updateData: any = {}
    if (cmd.fileName  !== undefined) updateData.fileName  = cmd.fileName
    if (cmd.category  !== undefined) updateData.category  = cmd.category
    if (cmd.tags      !== undefined) updateData.tags      = cmd.tags
    if (cmd.expiresAt !== undefined) updateData.expiresAt = cmd.expiresAt
    if (cmd.isFavorite !== undefined) updateData.isFavorite = cmd.isFavorite

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('AUCUN_CHAMP_A_METTRE_A_JOUR')
    }

    const updated = await this.documentModel
      .findOneAndUpdate(
        { _id: cmd.documentId, userId: cmd.userId },
        { $set: updateData },
        { new: true },
      )
      .lean()
      .exec()

    if (!updated) throw new NotFoundException('DOCUMENT_NOT_FOUND')

    return DocumentResponseDto.fromDocument(updated)
  }

  // ─────────────────────────────────────────────
  // COMMAND — Delete
  // ─────────────────────────────────────────────
  async delete(cmd: DeleteDocumentCommand): Promise<{ deleted: boolean }> {
    const result = await this.documentModel
      .deleteOne({ _id: cmd.documentId, userId: cmd.userId })
      .exec()

    if (result.deletedCount === 0) {
      throw new NotFoundException('DOCUMENT_NOT_FOUND')
    }

    return { deleted: true }
  }

  // ─────────────────────────────────────────────
  // QUERY — Get by ID
  // ─────────────────────────────────────────────
  async getById(query: GetDocumentByIdQuery): Promise<DocumentResponseDto> {
    const document = await this.documentModel
      .findOne({ _id: query.documentId, userId: query.ownerId })
      .lean()
      .exec()

    if (!document) throw new NotFoundException('DOCUMENT_NOT_FOUND')

    return DocumentResponseDto.fromDocument(document)
  }

  // ─────────────────────────────────────────────
  // QUERY — List avec filtres
  // ─────────────────────────────────────────────
  async list(query: ListDocumentsQuery): Promise<DocumentListResponseDto> {
    const filter: any = { userId: query.ownerId }

    if (query.category) filter.category = query.category
    if (query.search)   filter.fileName = { $regex: query.search, $options: 'i' }

    const skip = (query.page - 1) * query.pageSize

    const [items, total] = await Promise.all([
      this.documentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.pageSize)
        .lean()
        .exec(),
      this.documentModel.countDocuments(filter),
    ])

    return new DocumentListResponseDto(
      items.map(DocumentResponseDto.fromDocument),
      total,
      query.page,
      query.pageSize,
    )
  }

  // ─────────────────────────────────────────────
  // QUERY — Documents expirant bientôt
  // ─────────────────────────────────────────────
  async getExpiringSoon(
    userId: string,
    withinDays: number,
  ): Promise<DocumentResponseDto[]> {
    const now   = new Date()
    const limit = new Date()
    limit.setDate(limit.getDate() + withinDays)

    const items = await this.documentModel
      .find({ userId, expiresAt: { $gte: now, $lte: limit } })
      .sort({ expiresAt: 1 })
      .lean()
      .exec()

    return items.map(DocumentResponseDto.fromDocument)
  }
}