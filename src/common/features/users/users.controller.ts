import { Controller, Get, Post, Body, Put, Delete, Param, HttpStatus, UseGuards, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserCommand } from './commands/create-user.command';
import { GetOneUserQuery } from './query/getOne-user.query';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserCommand } from './commands/update-user.command';
import { DeleteUserCommand } from './commands/delete-user.command';
import { usersRepository } from './repository/users.repository';
import { GetUsersQuery } from './query/get-users.query';
import { Public } from '../../../guards/public.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PaginationDto } from '../documents/dto/pagination.dto';

// @ApiTags('users')
// @ApiBearerAuth()
@Controller('users')
export class UsersController {

constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('IUsersRepository') private readonly usersRepository: usersRepository,
  ) {}
  
  @Post('create')
  @Public()
  @ApiProperty({ description: 'Créer un nouveau utilisateur' })
  create(@Body() dto: CreateUserDto){
    return this.commandBus.execute(new CreateUserCommand(dto));
}

  @Get('All')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  getUsers( @Query() dto: PaginationDto,
  ) {
    return this.queryBus.execute(new GetUsersQuery(dto.page, dto.limit, dto.search, dto.dateCreationDebut, dto.dateCreationFin));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ description: 'Récuperer un users spécifique'})
  findOne(@Param('id') id: string ) {
   return this.queryBus.execute(new GetOneUserQuery(
     id
    ))
}

 @Put(':id')
  @Public()
  @ApiProperty({ description: 'modifier tous fournisseur'})
   async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ) {
    const result = await this.commandBus.execute(
      new UpdateUserCommand(id, data.nom, data.prenom, data.email, data.password),
    );

    return {
      message: 'utilisateur mis à jour',
      data: result,
    };
  }

  @Delete(':id')
  @ApiProperty({ description: 'supprimer un utilisateur'})
  async delete(
    @Param('id') id: string,
  ) {
    const result = await this.commandBus.execute(
      new DeleteUserCommand(id),
    );

    return {
      message: 'utilisateur supprimé',
      data: result,
    };
  }
}