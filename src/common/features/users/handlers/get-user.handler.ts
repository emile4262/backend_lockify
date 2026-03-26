import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserDocument } from 'src/common/schema/users.schema';
import { GetUserQuery } from '../query/get-user.query';
import { usersRepository } from '../repository/users.repository';

@Injectable()
@QueryHandler(GetUserQuery)
export class GetUsersHandler implements IQueryHandler<GetUserQuery> {
   constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: usersRepository,
  ) {}


   async execute(query: GetUserQuery): Promise<UserDocument[]> {
    return this.usersRepository.findAll(query);
  }
}