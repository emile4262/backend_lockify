import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class LoginRequestDto {
  @ApiProperty({ 
    description: 'L\'email',
    required: true
   }) 
  @IsEmail({}, { message: 'Email invalide' })
  email: string

  @ApiProperty({
    description:'password',
    required: true
  })
  @IsString()
  password: string
}