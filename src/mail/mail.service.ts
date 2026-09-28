// import { Injectable, ServiceUnavailableException } from '@nestjs/common';
// import { MailerService } from '@nestjs-modules/mailer';

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly gmail;
  private readonly from: string;
  private readonly templateDir: string;

  constructor(private readonly config: ConfigService) {
    const oauth2Client = new google.auth.OAuth2(
      this.config.get<string>('GMAIL_CLIEND_ID'),
      this.config.get<string>('GMAIL_CLIEND_SECRET'),
    );

    oauth2Client.setCredentials({
      refresh_token: this.config.get<string>('GMAIL_REFRESH_TOKEN'),
    });

    this.gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client,
    });

    this.from = this.config.get<string>('MAIL_FROM')!;

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

      const transporter = nodemailer.createTransport({
        streamTransport: true,
        buffer: true,
      });

      const mail = await transporter.sendMail({
        from: `"Karmolog4u" <${this.from}>`,
        to,
        subject,
        html,
        attachments: attachment ? [attachment] : [],
      });

      const raw = mail.message.toString('base64url');

      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw,
        },
      });

      return { message: 'success' };
    } catch (error) {
      console.error(error, 'error mail');

      throw new ServiceUnavailableException('Помилка відправлення email!');
    }
  }
}
