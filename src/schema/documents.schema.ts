import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoose from 'mongoose'

export type DocumentDocument = DocumentEntity & mongoose.Document

export enum typeDocument {
  IDENTITE = 'identite',
  SANTE = 'sante',
  FINANCE = 'finance',
  TRAVAIL = 'travail',
  LOGEMENT = 'logement',
  FAMILLE = 'famille',
  JURIDIQUE = 'juridique',
  CONTRAT = 'contrat',
  FACTURE = 'facture',
  PIECE_IDENTITE = 'piece_identite',
  PERMIS_CONDUITE = 'permis_conduite',
  PASSEPORT = 'passeport',
  AUTRE = 'autre',
}

@Schema({ timestamps: true, collection: 'documents' })
export class DocumentEntity {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId

  @Prop({ required: true, trim: true })
  fileName: string

  @Prop({ required: true })
  fileType: string

  @Prop({ required: true })
  fileSizeBytes: number

  @Prop({ required: true })
  pdfUrl: string

  @Prop({
    required: true,
    type: 'string',
    enum: [
          'IDENTITE',
          'SANTE',
          'FINANCE',
          'TRAVAIL',
          'LOGEMENT',
          'FAMILLE',
          'CONTRAT', 
          'FACTURE', 
          'PIECE_IDENTITE', 
          'PERMIS_CONDUITE', 
          'PASSEPORT', 
          'JURIDIQUE', 
          'AUTRE'
        ],
    default: 'AUTRE',
  })
  typeDocument: typeDocument

  // @Prop({ default: [] })
  // tags: string[]

  @Prop({ type: Date, default: null })
  expiresAt: Date | null

  @Prop({ default: false })
  isFavorite: boolean
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity)

DocumentSchema.index({ ownerId: 1 })
DocumentSchema.index({ ownerId: 1, category: 1 })
DocumentSchema.index({ ownerId: 1, expiresAt: 1 })