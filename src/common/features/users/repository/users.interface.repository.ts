import { UserDocument } from "src/schema/users.schema";
import { CreateUserDto } from "../dto/create-user.dto";
import { GetUserQuery } from "../query/get-user.query";
import { GetOneUserQuery } from "../query/getOne-user.query";
import { UpdateUserCommand } from "../commands/update-user.command";
import { DeleteUserCommand } from "../commands/delete-user.command";


export interface IUsersInterface{
    
    create(dto: CreateUserDto) : Promise<UserDocument>

    findAll(query: GetUserQuery) : Promise<UserDocument[]>

    findOne(dto: GetOneUserQuery): Promise<UserDocument>

    update(dto: UpdateUserCommand): Promise<UserDocument>

    delete(dto: DeleteUserCommand): Promise<UserDocument>
}