import { Inject, Injectable } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UserDocument } from 'src/schema/users.schema';
import { DeleteUserCommand } from '../commands/delete-user.command';
import { usersRepository } from '../repository/users.repository';

@Injectable()
@CommandHandler(DeleteUserCommand)
export class DeleteUsersHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject('IUsersRepository')
    private readonly UsersRepository: usersRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<UserDocument> {
    return this.UsersRepository.delete(command);
  }
}