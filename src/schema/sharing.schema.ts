import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoose from 'mongoose'

export type SharingDocument = SharingEntity & Document

export enum SharingPermission {
  LECTURE    = 'lecture',
  TELECHARGEMENT = 'telechargement',
}

export enum SharingStatus {
  ACTIF   = 'actif',
  EXPIRE  = 'expire',
  REVOQUE = 'revoque',
}

@Schema({ timestamps: true, collection: 'sharings' })
export class SharingEntity {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  usersId: mongoose.Types.ObjectId

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Document' })
  documentId: mongoose.Types.ObjectId

  @Prop({ required: true, unique: true })
  token: string

  @Prop({ required: true, enum: SharingPermission, default: SharingPermission.LECTURE })
  permission: SharingPermission

  @Prop({ required: true, enum: SharingStatus, default: SharingStatus.ACTIF })
  status: SharingStatus

  @Prop({ required: true })
  expiresAt: Date

  @Prop({ default: 0 })
  accessCount: number

  @Prop({ default: [] })
  accessHistory: {
    accessedAt: Date
    ip: string
  }[]

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const SharingSchema = SchemaFactory.createForClass(SharingEntity)
SharingSchema.index({ usersId: 1 })
SharingSchema.index({ documentId: 1 })