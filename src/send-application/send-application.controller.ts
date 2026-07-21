import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/isPublic.decorator';
import { SendApplicationService } from './send-application.service';
import { CreateAssociationApplicationDto } from './dto/send-application.dto';

@ApiTags('send-application')
@Public()
@Controller('/send-application')
export class SendApplicationController {
  constructor(private sendApplicationService: SendApplicationService) {}

  @Post('/')
  @ApiOperation({
    summary: 'Get User Product',
    description: 'Access restricted to auth users',
  })
  @ApiBadRequestResponse({
    description: 'Не вдалося отримати покупки користувача',
  })
  async sendApplication(@Body() body: CreateAssociationApplicationDto) {
    return await this.sendApplicationService.sendApplication(body);
  }
}
