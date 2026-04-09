import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator'
import { typeDocument } from 'src/schema/documents.schema'

export class UpdateDocumentRequestDto {

@ApiProperty({description: "Renseigner le nom du fichier (max 255 caractères)"})
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string

  @IsOptional()
  @IsEnum(typeDocument, { message: 'Catégorie invalide' })
  typeDocument?: typeDocument



  @IsOptional()
  @IsDateString()
  expiresAt?: string | null

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean
}