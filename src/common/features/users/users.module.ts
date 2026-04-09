import { CqrsModule} from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { MailModule } from 'src/common/mail/mail.module';
import { CreateUsersHandler } from './handlers/create-user.handler';
import { UpdateUsersHandler } from './handlers/update-user.handler';
import { DeleteUsersHandler } from './handlers/delete-user.handler';
import { GetOneUsersHandler } from './handlers/getOne-user.handler';
import { GetUserHandler } from './handlers/get-user.handler';
import { UserSchema } from 'src/schema/users.schema';
import { Auth, AuthSchema } from 'src/schema/auth.schema';
import { UsersController } from './users.controller';
import { usersRepository } from './repository/users.repository';

const CommandHandlers = [
  CreateUsersHandler,
  UpdateUsersHandler,
  DeleteUsersHandler,
];

const QueryHandlers = [
  GetUserHandler, 
  GetOneUsersHandler,
];

@Module({
  imports: [
    CqrsModule, 
    ConfigModule,
    MailModule,
    MongooseModule.forFeature([
      { name: 'User',  schema: UserSchema },
      { name: Auth.name, schema: AuthSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: 'IUsersRepository',
      useClass: usersRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers
  ],
  exports: [],
})
export class UsersModule {}
