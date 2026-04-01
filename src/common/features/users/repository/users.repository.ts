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
import { MailService } from 'src/common/mail/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class usersRepository implements IUsersInterface {
    constructor(
        @InjectModel('User')
        private readonly usersModel: Model<UserDocument>,
        private readonly mailService: MailService, 
        private readonly configService: ConfigService,
    ) {}

    private getWelcomeEmailTemplate(nom: string, links: string): string {
        return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur notre plateforme</title>
        <style>
            body {
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #AA7C03 0%, #AA7C03 100%);
                padding: 30px 20px;
                text-align: center;
            }
            
            .logo {
                background-color: #F9C63A;
                color: #333;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 18px;
                letter-spacing: 1px;
                display: inline-block;
                margin-bottom: 10px;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 24px;
                color: #603af9;
                margin-bottom: 20px;
                font-weight: 600;
            }
            
            .message {
                color: #555555;
                line-height: 1.6;
                margin-bottom: 25px;
                font-size: 16px;
            }
            
            .credentials-section {
                background-color: #f8f9fa;
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
                border-left: 4px solid #0c8abc;
            }
            
            .credentials-title {
                font-size: 18px;
                color: #333333;
                margin-bottom: 20px;
                font-weight: 600;
            }
            
            .credential-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                margin: 8px 0;
                background-color: white;
                border-radius: 8px;
                border: 1px solid #96bde4;
            }
            
            .credential-label {
                font-weight: 600;
                color: #333;
            }
            
            .credential-value {
                color: #666;
                font-family: 'Courier New', monospace;
                background-color: #f1f3f4;
                padding: 4px 8px;
                border-radius: 4px;
            }
            
            .password-value {
                color: #5e50db;
                font-weight: bold;
            }
            
            .footer {
                background-color: #f8f9fa;
                padding: 25px 30px;
                border-top: 1px solid #e1e5e9;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">
                    <img src="" alt="Logo" style="height: 80px; vertical-align: middle;">
                </div>
            </div>
            
            <div class="content">
                <div class="greeting">Bienvenue ${nom} !</div>
                
                <div class="message">
                    Nous sommes ravis de vous accueillir sur notre plateforme.
                </div>
                
                <div class="credentials-section">
                    <div class="credentials-title">Cliquez sur le lien ci dessous pour changer votre mot de passe :</div>
                    
                    <div class="credential-item">
                        <span class="credential-label"></span>
                        <span class="credential-value password-value">${links}</span>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <div>Ce message est envoyé automatiquement. Merci de ne pas y répondre.</div>
            </div>
        </div>
    </body>
    </html>
  `;
    }

    async create(dto: CreateUserDto): Promise<UserDocument> {
        const hashedPassword = await bcrypt.hash(dto.password, 10);       
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await this.usersModel.findOne({ email: dto.email });
        if (existingUser) {
            throw new Error('Cet email est déjà utilisé');
        }
        
        const user = await this.usersModel.create({
            nom: dto.nom,
            prenom: dto.prenom,
            email: dto.email,
            password: hashedPassword,
            isActive: true,
        });

        // Envoyer l'email de bienvenue
        try {
            const links = this.configService.get<string>('MAIL_LINK') ?? 'https://example.com/reset-password';
            const emailContent = this.getWelcomeEmailTemplate(dto.nom, links);
            await this.mailService.sendMailWithTemplate(
                dto.email,
                'Bienvenue sur notre plateforme',
                '',
                { html: emailContent },
            );
            
            
        } catch (error) {
            // Ne pas échouer la création de l'utilisateur si l'email échoue
        }

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
