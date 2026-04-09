import { IsEnum, IsNumber, Min, Max } from 'class-validator'
import { SharingPermission, SharingStatus } from 'src/schema/sharing.schema'

export class GenererSharingRequestDto {
  // @IsEnum(SharingPermission, { message: 'Permission invalide' })
  // permission: SharingPermission

  @IsNumber()
  @Min(1,   { message: 'Minimum 1 heure' })
  @Max(720, { message: 'Maximum 30 jours (720h)' })
  expirationHeures?: number
}

