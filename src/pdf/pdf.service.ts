import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { contractTemplate } from './templates/contract.template';

@Injectable()
export class PdfService {
  async generateContractPdf(data: any): Promise<any> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(contractTemplate(data), {
      waitUntil: 'networkidle0',
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();
    return pdf;
  }
}
