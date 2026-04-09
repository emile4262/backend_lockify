import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserDocument } from 'src/schema/users.schema';
import { usersRepository } from '../repository/users.repository';
import { GetUsersQuery } from '../query/get-users.query';
import { PaginationsDto } from '../dto/pagination.dto';
import { PaginationService } from 'src/pagination/pagination';

@Injectable()
@QueryHandler(GetUsersQuery)
export class GetUserHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: usersRepository,
  ) {}

  async execute(query: GetUsersQuery): Promise<PaginationService<UserDocument>> {
    // Convertir GetUsersQuery en PaginationsDto pour le repository
    const paginationDto: PaginationsDto = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      dateCreationDebut: query.dateCreationDebut,
      dateCreationFin: query.dateCreationFin,
    };
    
    return this.usersRepository.findAllByUsers(paginationDto);
  }
}