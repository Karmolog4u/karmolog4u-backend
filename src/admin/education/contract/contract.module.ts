import { ContractService } from './contract.service';
import { Module } from '@nestjs/common';
import { Contract, ContractSchema } from './schemas/contract.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
    ]),
  ],
  controllers: [],
  providers: [ContractService],
  exports: [ContractService, MongooseModule],
})
export class ContractModule {}
