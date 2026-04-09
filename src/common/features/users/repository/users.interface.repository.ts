import { UserDocument } from "src/schema/users.schema";
import { CreateUserDto } from "../dto/create-user.dto";
import { PaginationsDto } from "../dto/pagination.dto";
import { GetOneUserQuery } from "../query/getOne-user.query";
import { UpdateUserCommand } from "../commands/update-user.command";
import { DeleteUserCommand } from "../commands/delete-user.command";
import { PaginationService } from 'src/pagination/pagination';

export interface IUsersInterface{
    
    create(dto: CreateUserDto) : Promise<UserDocument>

    findAllByUsers(query: PaginationsDto) : Promise<PaginationService<UserDocument>>

    findOne(dto: GetOneUserQuery): Promise<UserDocument>

    update(dto: UpdateUserCommand): Promise<UserDocument>

    delete(dto: DeleteUserCommand): Promise<UserDocument>
}