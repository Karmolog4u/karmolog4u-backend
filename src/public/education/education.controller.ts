import { Controller, Get, Param, ParseEnumPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/isPublic.decorator';
import { PublicEducationPrice } from './education.service';
import { EducationType } from './enums/education-type.enum';

@ApiTags('Public education')
@Public()
@Controller('public/education')
export class PublicEducationController {
  constructor(private readonly publicEducationPrice: PublicEducationPrice) {}
  @Get(':type')
  async getPrice(
    @Param('type', new ParseEnumPipe(EducationType))
    type: EducationType,
  ) {
    return await this.publicEducationPrice.getEducationPrice(type);
  }
}
