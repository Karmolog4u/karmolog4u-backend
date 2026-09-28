import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAssociationApplicationDto } from './dto/send-application.dto';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  AssociationApplication,
  AssociationApplicationDocument,
} from './schemas/send-application.schema';
import { Model } from 'mongoose';

@Injectable()
export class SendApplicationService {
  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @InjectModel(AssociationApplication.name)
    private readonly applicationModel: Model<AssociationApplicationDocument>,
  ) {}
  async sendApplication(data: CreateAssociationApplicationDto) {
    //save to db
    const application = await this.applicationModel.create(data);

    let adminEmailSent = false;
    let userEmailSent = false;

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    try {
      // send app to admin
      await this.mailService.sendEmail(
        adminEmail,
        'Нова заявка на вступ до Асоціації',
        'sendApplicationAdmin',
        application.toObject(),
      );

      adminEmailSent = true;

      //send to customer
      await this.mailService.sendEmail(
        application.email,
        'Вашу заявку отримано',
        'sendApplicationCustomer',
        {
          name: application.name,
        },
      );
      userEmailSent = true;

      application.adminEmailSent = adminEmailSent;
      application.userEmailSent = userEmailSent;

      await application.save();
      return {
        success: true,
      };
    } catch (error) {
      throw new InternalServerErrorException('Не вдалося відправити email');
    }
  }
}
