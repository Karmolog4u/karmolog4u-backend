import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GiftService } from './gift.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/isPublic.decorator';

@ApiTags('gifts')
@Controller('products/gifts')
export class GiftController {
  constructor(private giftService: GiftService) {}

  @Public()
  @Get('get-all')
  @ApiOperation({ summary: 'Get gift prevue' })
  @ApiResponse({
    status: 200,
    description: 'get-gift',
    type: Array,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getGifts() {
    try {
      return await this.giftService.findPrevueGifts();
    } catch (error) {
      throw new NotFoundException('Gifts not found');
    }
  }

  @Public()
  @Get('get/:id')
  @ApiOperation({ summary: 'Get gift by id' })
  @ApiResponse({
    status: 200,
    description: 'get-gift',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getGiftById(@Param('id') id: string) {
    try {
      return await this.giftService.findGiftById(id);
    } catch (error) {
      throw new NotFoundException('Gift not found');
    }
  }
}
