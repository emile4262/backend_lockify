import { Inject, Injectable } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UserDocument } from 'src/common/schema/users.schema';
import { usersRepository } from '../repository/users.repository';
import { UpdateUserCommand } from '../commands/update-user.command';

@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUsersHandler implements ICommandHandler<UpdateUserCommand> {
   constructor(
    @Inject('IUsersRepository')
    private readonly UsersRepository: usersRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UserDocument> {
    return this.UsersRepository.update(command);
  }
}
