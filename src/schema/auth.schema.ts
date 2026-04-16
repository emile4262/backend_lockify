// auth/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type AuthDocument = Auth & Document

@Schema({ timestamps: true, collection: 'users' })
export class Auth {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string

  @Prop({ required: true })
  passwordHash: string

  @Prop({ default: null })
  lastPassword: string

  @Prop({ required: true })
  otpHash: string;

  @Prop()
  resetOtp: string

  @Prop({ required: true })
  tokenHash: string;

  @Prop()
  resetOtpExpires: Date

  @Prop({ default: 0 })
  resetOtpAttempts: number

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;

  @Prop({ default: false })
  isLocked: boolean
}

export const AuthSchema = SchemaFactory.createForClass(Auth)

