import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UnauthorizedException, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { LoginUserCommand } from '../commands/login-user.command'
import { AuthResponseDto } from '../dto/auth.response.dto'
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose'
import { Auth } from 'src/common/schema/auth.schema'

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @InjectModel(Auth.name)
    private readonly userModel: Model<any>,
    private readonly jwtService: JwtService
  ) {}

  async execute(cmd: LoginUserCommand): Promise<AuthResponseDto> {
    const user = await this.userModel.findOne({ email: cmd.email })
    if (!user) {
      throw new UnauthorizedException('INVALID_EMAIL')
    }

    const isValid = await bcrypt.compare(cmd.password, user.password)
    if (!isValid) {
      throw new UnauthorizedException('INVALID_PASSWORD')
    }

    const accessToken = this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
    })

    return new AuthResponseDto(
      accessToken,
      user._id.toString(),
      user.email,
    )
  }
}