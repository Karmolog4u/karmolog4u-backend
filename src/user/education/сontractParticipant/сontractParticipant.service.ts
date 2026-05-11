import { CoursePurchase } from './../../../coursePurchase/schemas/coursePurchase.schema';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ContractParticipant } from './schemas/сontractParticipant.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { UserEntity } from 'src/user/dto/user-entity.dto';
import { SignDto } from './dto/sign.dto';
import { Contract } from 'src/admin/education/contract/schemas/contract.schema';
import { PdfService } from 'src/pdf/pdf.service';
import { ConfigService } from '@nestjs/config';
import { Course } from 'src/admin/education/course/schemas/course.schema';

@Injectable()
export class ContractParticipantService {
  constructor(
    @InjectModel(ContractParticipant.name)
    private contractParticipantModel: Model<ContractParticipant>,
    @InjectModel(Contract.name)
    private contractModel: Model<Contract>,
    @InjectModel(CoursePurchase.name)
    private coursePurchaseModel: Model<CoursePurchase>,
    @Inject(MailService) private mailService: MailService,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private readonly pdfService: PdfService,
    private readonly configService: ConfigService,
  ) {}

  async sign(user: UserEntity, data: SignDto, id: any) {
    const contract = await this.contractModel.findOne({
      course: id,
    });
    if (!contract) {
      throw new InternalServerErrorException('Контракт не знайдено');
    }
    const checkSign = await this.contractParticipantModel.findOne({
      userId: user._id,
      courseId: id,
      contractId: contract._id,
    });

    if (checkSign) {
      throw new BadRequestException('Контракт вже підписаний');
    }

    const sign = new this.contractParticipantModel({
      userId: user._id,
      courseId: id,
      contractId: contract._id,
      ...data,
    });
    await sign.save();
    if (!sign) {
      throw new BadRequestException(
        'Не вдалося створити запис учасника контракту',
      );
    }
    const updatePurchase = await this.coursePurchaseModel.findOneAndUpdate(
      { courseId: id, userId: user._id }, // filter
      { $set: { agreement: true } }, // update
      { new: true }, // return updated doc
    );
    if (!updatePurchase) {
      throw new BadRequestException('');
    }
    const course = await this.courseModel.findById(id).select('name').lean();
    if (!course) {
      throw new InternalServerErrorException('Курс не знайдено');
    }

    const courseName = course ? course.name : 'Course';

    const signPdf = await this.pdfService.generateContractPdf({
      fullname: user.name + ' ' + user.lastName,
      idCode: sign.idCode,
      passport: sign.passportData,
      phone: sign.phone,
      points: contract.points,
      date: contract.date,
      header: contract.header,
    });

    const mailData = {
      fullname: `${user.name} ${user.lastName}`,
      courseId: id,
      userId: user._id,
      email: user.email,
      phone: data.phone,
      idCode: data.idCode,
      passport: data.passportData,
      courseName,
      signDate: new Date().toLocaleDateString('uk-UA'),
    };
    try {
      const adminMail = await this.mailService.sendEmail(
        this.configService.get('ADMIN_EMAIL'),
        'New Contract Signed',
        'contract',
        {
          isAdmin: true,
          ...mailData,
        },
        {
          filename: 'dogovir.pdf',
          content: signPdf,
          contentType: 'application/pdf',
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Помилка відправлення листа адміну',
      );
    }
    try {
      const userMail = await this.mailService.sendEmail(
        user.email,
        'Contract Signed Successfully',
        'contract-signed-user',
        {
          ...mailData,
        },
        {
          filename: 'dogovir.pdf',
          content: signPdf,
          contentType: 'application/pdf',
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Помилка відправлення листа користувачу',
      );
    }
    return {
      message: 'Success',
    };
  }

  async downloadContract(user: UserEntity, id: any) {
    const purchase = await this.coursePurchaseModel.findOne({
      userId: user._id,
      courseId: id,
    });
    if (!purchase || !purchase.agreement) {
      throw new BadRequestException('Контракт не підписаний');
    }

    const contract = await this.contractModel.findOne({
      course: id,
    });
    if (!contract) {
      throw new InternalServerErrorException('Контракт не знайдено');
    }

    const ContractParticipant = await this.contractParticipantModel.findOne({
      userId: user._id,
      courseId: id,
      contractId: contract._id,
    });
    if (!ContractParticipant) {
      throw new InternalServerErrorException(
        'Дані учасника контракту не знайдено',
      );
    }

    return await this.pdfService.generateContractPdf({
      fullname: user.name + ' ' + user.lastName,
      idCode: ContractParticipant.idCode,
      passport: ContractParticipant.passportData,
      phone: ContractParticipant.phone,
      points: contract.points,
      date: contract.date,
      header: contract.header,
    });
  }

  async getContractDetails(user: UserEntity, courseId: string) {
    const purchase = await this.coursePurchaseModel.findOne({
      userId: user._id,
      courseId: courseId,
    });

    if (!purchase) {
      throw new BadRequestException('Курс не знайдено в покупках');
    }

    if (!purchase.agreement) {
      return {
        agreement: false,
        message: 'Контракт не підписаний',
      };
    }

    const contract = await this.contractModel.findOne({
      course: courseId,
    });
    if (!contract) {
      throw new NotFoundException('Контракт не знайдено');
    }

    const contractParticipant = await this.contractParticipantModel.findOne({
      userId: user._id,
      courseId: courseId,
      contractId: contract._id,
    });
    if (!contractParticipant) {
      throw new NotFoundException('Дані учасника контракту не знайдено');
    }

    const course = await this.courseModel
      .findById(courseId)
      .select('name')
      .lean();
    if (!course) {
      throw new NotFoundException('Курс не знайдено');
    }

    return {
      agreement: true,
      contractDetails: {
        contractId: contract._id,
        courseId: courseId,
        courseName: course.name,
        userId: user._id,
        fullname: `${user.name} ${user.lastName}`,
        email: user.email,
        phone: contractParticipant.phone,
        idCode: contractParticipant.idCode,
        passportData: contractParticipant.passportData,
        contractDate: contract.date,
        header: contract.header,
        points: contract.points,
        messenger: contractParticipant.messenger,
      },
    };
  }
}
