import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contracts } from './entities/contract.entity';
import { RentsModule } from '../rents/rents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contracts]),
    RentsModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule { }
