import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(to: string, subject: string, html: string) {
    const result = await this.mailerService.sendMail({
      to,
      subject,
      html,
    });

    // Logs pour l'envi d'email
    console.log('=== EMAIL ENVOYÉ (GMAIL RÉEL) ===');
    console.log('Destinataire:', to);
    console.log('Sujet:', subject);
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    console.log('Accepted:', result.accepted);
    console.log('====================================');

    return result;
  }

  async sendMailWithTemplate(
    to: string,
    subject: string,
    template: string,
    context: any,
  ) {
    const result = await this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });

    // Logs pour l'envi d'email template
    console.log('=== EMAIL TEMPLATE ENVOYÉ (GMAIL RÉEL) ===');
    console.log('Destinataire:', to);
    console.log('Sujet:', subject);
    console.log('Template:', template);
    console.log('Contexte:', context);
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    console.log('Accepted:', result.accepted);
    console.log('==========================================');

    return result;
  }

  private getMessageUrl(info: any): string {
    // Pour Ethereal, extraire l'ID du messageId et générer l'URL correcte
    if (info.messageId) {
      // Le messageId ressemble à: <d60bd1e1-8e7c-8b9b-d852-9996ac9e337d@lockify.local>
      const messageId = info.messageId.replace(/[<>]/g, '').split('@')[0];
      return `https://ethereal.email/message/${messageId}`;
    }
    return 'URL non disponible';
  }
}
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => {
        // Configuration Gmail avec valeurs en dur pour contourner le problème
        const emailUser = process.env.EMAIL_USER || 'lockifydoc@gmail.com';
        const emailPass = process.env.EMAIL_PASS || 'ltqjzlzruvnmvmqn';
        
        console.log('=== CONFIGURATION EMAIL GMAIL (ENVOI RÉEL) ===');
        console.log('Email utilisateur:', emailUser);
        console.log('Password OK:', emailPass ? 'YES' : 'NO');
        
        return {
          transport: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: emailUser,
              pass: emailPass,
            },
          },
          defaults: {
            from: `"Lockify" <${emailUser}>`,
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
