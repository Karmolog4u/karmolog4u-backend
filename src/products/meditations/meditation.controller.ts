import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { MeditationService } from './meditation.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MeditationEntity } from './dto/meditation-entity.dto';
import { Public } from 'src/common/decorators/isPublic.decorator';

@ApiTags('meditations')
@Controller('products/meditations')
export class MeditationController {
  constructor(private meditationService: MeditationService) {}

  @Public()
  @Get('get-all')
  @ApiOperation({ summary: 'Get meditation prevue' })
  @ApiResponse({
    status: 200,
    description: 'get-meditation',
    type: Array,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getMeditation() {
    try {
      return await this.meditationService.findPrevueMeditation();
    } catch (error) {
      throw new NotFoundException('Meditations not found');
    }
  }

  @Public()
  @Get('get/:id')
  @ApiOperation({ summary: 'Get meditation by id' })
  @ApiResponse({
    status: 200,
    description: 'get-meditation',
    type: MeditationEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getMeditationById(@Param('id') meditationId: string) {
    try {
      const meditation = await this.meditationService.findMeditationById(
        meditationId,
      );

      return meditation;
    } catch (error) {
      throw new NotFoundException('Meditation not found');
    }
  }
}
