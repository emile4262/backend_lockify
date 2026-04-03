import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AuthDocument, Auth } from "src/schema/auth.schema";

@Injectable()
export class UserRepository implements UserRepository {
  constructor(
    @InjectModel(Auth.name)
    private readonly userModel: Model<AuthDocument>,
  ) {}

  async execute(data: {
    email: string
    passwordHash: string
  }): Promise<AuthDocument> {
    return this.userModel.create(data)
  }

  // async findByEmail(email: string): Promise<UserDocument | null> {
  //   return this.userModel
  //     .findOne({ email: email.toLowerCase() })
  //     .exec()
  // }

  // async findById(id: string): Promise<UserDocument | null> {
  //   return this.userModel
  //     .findById(id)
  //     .select('-passwordHash')
  //     .lean()
  //     .exec()
  // }

  // async existsByEmail(email: string): Promise<boolean> {
  //   const count = await this.userModel.countDocuments({
  //     email: email.toLowerCase(),
  //   })
  //   return count > 0
  // }

  
}