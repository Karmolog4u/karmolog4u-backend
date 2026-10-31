import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly templateDir: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.getOrThrow<string>('RESEND_API_KEY'));

    this.from = this.config.getOrThrow<string>('MAIL_FROM');

    this.templateDir = path.join(process.cwd(), 'templates');
  }

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
      const templatePath = path.join(this.templateDir, `${template}.hbs`);

      const templateSource = fs.readFileSync(templatePath, 'utf8');

      const compiledTemplate = handlebars.compile(templateSource, {
        strict: true,
      });

      const html = compiledTemplate(context);

      console.log('html: ', html);

      const attachments = attachment
        ? [
            {
              filename: attachment.filename,
              ...(attachment.content
                ? { content: attachment.content.toString('base64') }
                : { path: attachment.path }),
              ...(attachment.contentType
                ? { contentType: attachment.contentType }
                : {}),
            },
          ]
        : [];

      const { data, error } = await this.resend.emails.send({
        from: `Karmolog4u <${this.from}>`,
        to: [to],
        subject,
        html,
        attachments,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
      }

      return {
        message: 'success',
        id: data?.id,
      };
    } catch (error) {
      console.error(error, 'error mail');

      throw new ServiceUnavailableException('Помилка відправлення email!');
    }
  }
}
