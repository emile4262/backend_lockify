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
import { DocumentCategory } from 'src/common/schema/documents.schema'

export class UpdateDocumentRequestDto {

@ApiProperty({description: "Renseigner le nom du fichier (max 255 caractères)"})
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string

    @ApiProperty({description: "Renseigner la catégorie du document"})
  @IsOptional()
  @IsEnum(DocumentCategory, { message: 'Catégorie invalide' })
  category?: DocumentCategory

    @ApiProperty({description: "Renseigner les tags associés au document (facultatif)"})
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiProperty({description: "Renseigner la date d'expiration du document (facultatif, format ISO 8601)"})
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null

    @ApiProperty({description: "Indiquer si le document est un favori (facultatif)"})
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean
}