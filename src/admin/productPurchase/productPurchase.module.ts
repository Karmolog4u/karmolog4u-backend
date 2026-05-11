import { Module } from '@nestjs/common';
import { ProductPurchaseModule as PurchaseModule } from 'src/productPurchase/productPurchase.module';
import { ProductPurchaseController } from './productPurchase.controller';
import { ProductPurchaseService } from './productPurchase.service';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PurchaseModule, UserModule, MailModule, ConfigModule],
  controllers: [ProductPurchaseController],
  providers: [ProductPurchaseService],
})
export class ProductPurchaseModule {}
