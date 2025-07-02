import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payments.service';
import { PaymentController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { OwnerModule } from '../owner/owner.module';
import { StripeService } from './stripe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    forwardRef(() => OwnerModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeService],
  exports: [PaymentService, StripeService],
})
export class PaymentModule { }
