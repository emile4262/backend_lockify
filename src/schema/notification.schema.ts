import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoose from 'mongoose'

export type NotificationDocument = NotificationEntity & Document

export enum NotificationType {
  EXPIRATION_J30 = 'expiration_j30',
  EXPIRATION_J15 = 'expiration_j15',
  EXPIRATION_J7  = 'expiration_j7',
  EXPIRATION_J1  = 'expiration_j1',
  DOCUMENT_AJOUTE = 'document_ajoute',
  INFO            = 'info',
}

@Schema({ timestamps: true, collection: 'notifications' })
export class NotificationEntity {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  message: string

  @Prop({ default: false })
  isRead: boolean

  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: 'Document' })
  documentId: mongoose.Types.ObjectId | null
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationEntity)
NotificationSchema.index({ userId: 1, isRead: 1 })
NotificationSchema.index({ userId: 1, createdAt: -1 })