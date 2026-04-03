import { Inject, Injectable } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UserDocument } from 'src/schema/users.schema';
import { CreateUserCommand } from '../commands/create-user.command';
import { usersRepository } from '../repository/users.repository';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUsersHandler implements ICommandHandler<CreateUserCommand> {
   constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: usersRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserDocument> {
    return this.usersRepository.create(command.dto)
  }
}