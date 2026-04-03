// auth/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type AuthDocument = Auth & Document

@Schema({ timestamps: true, collection: 'users' })
export class Auth {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string

  @Prop({ required: true })
  password: string
}

export const AuthSchema = SchemaFactory.createForClass(Auth)

