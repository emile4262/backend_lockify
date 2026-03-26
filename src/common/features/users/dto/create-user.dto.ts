import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({description: "Renseigner votre nom"})
  @IsNotEmpty()
  @IsString()
  nom: string;

  @ApiProperty({description: "Renseigner votre prenom"})
  @IsNotEmpty()
  @IsString()
  prenom: string;

  @ApiProperty({description: "Renseigner votre email"})
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({description: "Renseigner votre password"})
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}