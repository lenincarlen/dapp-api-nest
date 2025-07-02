import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodsService } from './payment_methods.service';
import { PaymentMethodsController } from './payment_methods.controller';
import { PaymentMethods } from './entities/payment_method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethods])],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
  exports: [PaymentMethodsService] // Export PaymentMethodsService if it needs to be used in other modules
})
export class PaymentMethodsModule {}
