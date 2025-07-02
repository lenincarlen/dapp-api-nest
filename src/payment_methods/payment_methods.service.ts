import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentMethodDto } from './dto/create-payment_method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment_method.dto';
import { PaymentMethods } from './entities/payment_method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethods)
    private paymentMethodRepository: Repository<PaymentMethods>,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethods> {
    const newPaymentMethod = this.paymentMethodRepository.create(createPaymentMethodDto);
    return this.paymentMethodRepository.save(newPaymentMethod);
  }

  async findAll(): Promise<PaymentMethods[]> {
    return this.paymentMethodRepository.find();
  }

  async findOne(id: string): Promise<PaymentMethods> {
    const paymentMethod = await this.paymentMethodRepository.findOne({ where: { id } });
    if (!paymentMethod) {
      throw new NotFoundException(`PaymentMethod with ID "${id}" not found`);
    }
    return paymentMethod;
  }

  async update(id: string, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethods> {
    const paymentMethod = await this.findOne(id);
    this.paymentMethodRepository.merge(paymentMethod, updatePaymentMethodDto);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async remove(id: string): Promise<void> {
    const result = await this.paymentMethodRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`PaymentMethod with ID "${id}" not found`);
    }
  }
}
