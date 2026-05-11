import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GuidesAndBooksService } from './guides_and_books.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/isPublic.decorator';

@ApiTags('guides-and-books')
@Controller('products/guides-and-books')
export class GuidesAndBooksController {
  constructor(private guidesAndBooksService: GuidesAndBooksService) {}

  @Public()
  @Get('get-all')
  @ApiOperation({ summary: 'Get guides and books prevue' })
  @ApiResponse({
    status: 200,
    description: 'get-guides-and-books',
    type: Array,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getGuidesAndBooks() {
    try {
      return await this.guidesAndBooksService.findPrevueGuidesAndBooks();
    } catch (error) {
      throw new NotFoundException('Guides and books not found');
    }
  }

  @Public()
  @Get('get/:id')
  @ApiOperation({ summary: 'Get guides and books by id' })
  @ApiResponse({
    status: 200,
    description: 'get-guides-and-books',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getGuidesAndBooksById(@Param('id') id: string) {
    try {
      const guidesAndBooks =
        await this.guidesAndBooksService.findGuidesAndBooksById(id);
      return guidesAndBooks;
    } catch (error) {
      throw new NotFoundException('Guides and books not found');
    }
  }
}
