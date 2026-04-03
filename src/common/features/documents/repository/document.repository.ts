import { Injectable, BadRequestException, NotFoundException, HttpException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as mongoose from 'mongoose'
import { DocumentEntity, DocumentDocument } from 'src/schema/documents.schema'
import { DeleteDocumentCommand } from '../commands/delete.command'
import { UpdateDocumentCommand } from '../commands/update.command'
import { UploadDocumentCommand } from '../commands/upload.command'
import { DocumentResponseDto} from '../dto/document.response.dto'
import { GetDocumentByIdQuery } from '../query/getOne.document'
import { ListDocumentsQuery } from '../query/list.document'
import { PaginationService } from 'src/pagination/pagination'
import { PaginationDto } from '../dto/pagination.dto'

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

  // COMMAND — Upload
  async upload(cmd: UploadDocumentCommand): Promise<DocumentResponseDto> {
    try {
      const document = await this.documentModel.create({
        userId:       new mongoose.Types.ObjectId(cmd.userId),
        fileName:      cmd.fileName,
        mimeType:      cmd.mimeType,
        fileSizeBytes: cmd.fileSizeBytes,
        pdfUrl:    `uploads/${cmd.userId}/${cmd.fileName}`,
        category:      cmd.category,
        tags:          [],
        expiresAt:     cmd.expiresAt,
      })
 
      return DocumentResponseDto.fromDocument(document)
    } catch (error) {
      console.error('Erreur upload détaillée:', error);
      throw new HttpException(`Erreur lors de l'upload du fichier: ${error.message}`, 500)
    }
  }

  // COMMAND — Update
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
        { _id: cmd.documentId, ownerId: cmd.userId },
        { $set: updateData },
        { new: true },
      )
      .lean()
      .exec()

    if (!updated) throw new NotFoundException('DOCUMENT_NOT_FOUND')

    return DocumentResponseDto.fromDocument(updated)
  }

  // COMMAND — Delete
  
  async deleteDocument(id: string): Promise<DocumentResponseDto> {
    const document = await this.documentModel.findById(id);

    if (!document) {
      throw new NotFoundException('Document non trouvé.');
    }

    // Hard delete - supprimer définitivement le document
    const deletedDocument = await this.documentModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedDocument) {
      throw new NotFoundException('Document non trouvé.');
    }

    return DocumentResponseDto.fromDocument(deletedDocument);
  }

  
  // QUERY — Get by ID
  async getById(id: string): Promise<DocumentResponseDto> {
    const document = await this.documentModel
      .findOne({ _id: id })
      .lean()
      .exec()

    if (!document) throw new NotFoundException('DOCUMENT_NOT_FOUND')

    return DocumentResponseDto.fromDocument(document)
  }

  // QUERY — List avec filtres
  async findAllByUsers(
    dto: PaginationDto,
  ): Promise<PaginationService<DocumentEntity>>{
    const { search, page, limit, dateCreationDebut, dateCreationFin } = dto;
    const query: any = {};

    const Page = page ? parseInt(String(page), 10) : 1;
    const Limit = limit ? parseInt(String(limit), 10) : 10;

    if (search) {
      query.designation = { $regex: search, $options: 'i' };
    }
    // Filtres de date - corrigé pour fonctionner individuellement
    if (dateCreationDebut || dateCreationFin) {
      query.createdAt = {};
      if (dateCreationDebut) {
        query.createdAt.$gte = new Date(dateCreationDebut);
      }
      if (dateCreationFin) {
        const endDate = new Date(dateCreationFin);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    const data = await this.documentModel
      .find(query)
      .sort({ createdAt: 'desc', _id: 'desc' })
      .skip((Page - 1) * Limit)
      .limit(Limit)
      .exec();
            
    const total = await this.documentModel.countDocuments(query);
    return new PaginationService<DocumentEntity>(data, Page, Limit, total);
  } 
  // QUERY — Documents expirant bientôt
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