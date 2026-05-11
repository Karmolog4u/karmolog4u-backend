import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
    attachment?: {
      filename: string;
      path?: string;
      content?: Buffer;
      contentType?: string;
    },
  ) {
    try {
      await this.mailerService.sendMail({
        to, // Recipient email
        subject, // Subject
        template, // Template file (if using handlebars, pug, etc.)
        context, // Data to inject into the template
        attachments: attachment ? [attachment] : [],
      });
      return { message: 'success' };
    } catch (error) {
      console.log(error, 'error mail');

      throw new ServiceUnavailableException('Помилка відправлення email!');
    }
  }
}
