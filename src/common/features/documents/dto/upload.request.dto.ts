import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator'
import { DocumentCategory } from 'src/schema/documents.schema'

export class UploadDocumentRequestDto {

  @ApiProperty({description: "Renseigner le nom du fichier (max 255 caractères)"})
  @IsString()
  @MaxLength(255)
  fileName: string

  @ApiProperty({description: "Renseigner la catégorie du document"})
  @IsEnum(DocumentCategory, { message: 'Catégorie invalide' })
  category: DocumentCategory

   

  @IsOptional()
  @IsDateString({}, { message: 'Date d\'expiration invalide' })
  expiresAt?: string
}