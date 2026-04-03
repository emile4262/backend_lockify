import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoose from 'mongoose'

export type CategoryDocument = CategoryEntity & Document

@Schema({ timestamps: true, collection: 'categories' })
export class CategoryEntity {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ required: true, unique: true, trim: true })
  slug: string

  // @Prop({ default: null, type: String })
  // icon: string | null

  @Prop({ default: null, type: String })
  description: string | null

  @Prop({ default: true })
  isActive: boolean

  // Référence optionnelle à l'utilisateur (null = catégorie globale)
  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  usersId: mongoose.Types.ObjectId | null
}

export const CategorySchema = SchemaFactory.createForClass(CategoryEntity)
CategorySchema.index({ usersId: 1 })