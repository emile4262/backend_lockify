import { Inject, Injectable } from '@nestjs/common';
import { ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserDocument } from 'src/common/schema/users.schema';
import { usersRepository } from '../repository/users.repository';
import { GetOneUserQuery } from '../query/getOne-user.query';

@Injectable()
@QueryHandler(GetOneUserQuery)
export class GetOneUsersHandler implements IQueryHandler<GetOneUserQuery> {
    constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: usersRepository,
  ) {}


   async execute(query: GetOneUserQuery): Promise<UserDocument> {
    return this.usersRepository.findOne(query);
  }
}