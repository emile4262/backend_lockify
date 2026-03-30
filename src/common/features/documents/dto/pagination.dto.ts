import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationDto {
 

  @IsOptional()
  @ApiPropertyOptional({ description: 'Page actuelle' })
  page?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Limite par page' })
  limit?: string;

  @IsOptional()
    @ApiPropertyOptional({
      description: 'Date de création - début (YYYY-MM-DD)',
      example: '2024-01-01',
    })
    dateCreationDebut?: string;
  
    @IsOptional()
    @ApiPropertyOptional({
      description: 'Date de création - fin (YYYY-MM-DD)',
      example: '2024-12-31',
    })
    dateCreationFin?: string;

    @IsOptional()
    @ApiPropertyOptional({
      description: 'Recherche par designation (recherche partielle, insensible à la casse)',
    })
    search?: string;
}