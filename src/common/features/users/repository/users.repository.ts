import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/common/schema/users.schema';
import { IUsersInterface } from './users.interface.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUserQuery } from '../query/get-user.query';
import { GetOneUserQuery } from '../query/getOne-user.query';
import { UpdateUserCommand } from '../commands/update-user.command';
import { DeleteUserCommand } from '../commands/delete-user.command';

@Injectable()
export class usersRepository implements IUsersInterface {
    constructor(
        @InjectModel('User')
        private readonly usersModel: Model<UserDocument>
    ) {}

    async create(dto: CreateUserDto): Promise<UserDocument> {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        
        const user = await this.usersModel.create({
            nom: dto.nom,
            prenom: dto.prenom,
            email: dto.email,
            password: hashedPassword,
            isActive: true,
        });

        return user;
    }

    async findAll(query: GetUserQuery): Promise<UserDocument[]> {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        
        const users = await this.usersModel
            .find()
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
        
        return users;
    }

    async findOne(query: GetOneUserQuery): Promise<UserDocument> {
        const user = await this.usersModel.findById(query.id).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }

    async update(command: UpdateUserCommand): Promise<UserDocument> {
        const { id, nom, prenom, email, password } = command;
        
        const updateData: any = {};
        if (nom) updateData.nom = nom;
        if (prenom) updateData.prenom = prenom;
        if (email) updateData.email = email;
        if (password) updateData.password = await bcrypt.hash(password, 10);
        
        const user = await this.usersModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async delete(command: DeleteUserCommand): Promise<UserDocument> {
        const user = await this.usersModel.findByIdAndDelete(command.id);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }
}