import { PdfService } from './pdf.service';

import { Module } from '@nestjs/common';

@Module({
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
