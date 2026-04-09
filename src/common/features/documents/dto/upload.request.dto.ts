import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { typeDocument } from 'src/schema/documents.schema'

export class UploadDocumentRequestDto {

  @ApiProperty({description: "Renseigner le nom du fichier (max 255 caractères)"})
  @IsString()
  @MaxLength(255)
  fileName: string

  @ApiProperty({description: "Renseigner la catégorie du document"})
  @IsEnum({
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
        ] },
  )
  @Transform(({ value }) => value?.toLowerCase()) // Transforme FACTURE en facture
  typeDocument: typeDocument

  // Alias pour compatibilité avec les anciens appels
  @ApiProperty({description: "Renseigner la catégorie du document (alias)"})
  @IsEnum({
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
        ] },
  )
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase()) // Transforme FACTURE en facture
  DocumentCategory?: typeDocument

  @IsOptional()
  @IsDateString({}, { message: 'Date d\'expiration invalide' })
  expiresAt?: string
}