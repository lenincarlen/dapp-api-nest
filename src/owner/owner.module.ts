import { Module, forwardRef } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Owners } from './entities/owner.entity';
import { PaymentModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Owners]),
    forwardRef(() => PaymentModule),
  ],
  controllers: [OwnerController],
  providers: [OwnerService],
  exports: [OwnerService],
})
export class OwnerModule { }
