import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { v4 as uuidv4 } from 'uuid';
import { OwnerService } from '../owner/owner.service';

@Injectable()
export class PaymentService {
  private payments: Payment[] = [];

  constructor(
    @Inject(forwardRef(() => OwnerService))
    private readonly ownerService: OwnerService,
  ) { }

  create(createPaymentDto: CreatePaymentDto): Payment {
    // Calcular fee y neto
    const fee = Math.round((createPaymentDto.amount || 0) * 0.05 * 100) / 100;
    const net_amount = Math.round(((createPaymentDto.amount || 0) - fee) * 100) / 100;

    const newPayment: Payment = {
      id: uuidv4(),
      ...createPaymentDto,
      stripe_session_id: createPaymentDto.stripe_session_id ?? null,
      stripe_payment_intent: createPaymentDto.stripe_payment_intent ?? null,
      payment_history: createPaymentDto.payment_history ?? null,
      fee,
      net_amount,
      paid_at: createPaymentDto.paid_at ? new Date(createPaymentDto.paid_at) : null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.payments.push(newPayment as Payment);

    // Actualizar balance del owner
    if (newPayment.owner_id) {
      const owner = this.ownerService.findOne(newPayment.owner_id);
      if (owner) {
        const updatedBalance = (owner.balance || 0) + net_amount;
        this.ownerService.update(owner.id, { balance: updatedBalance });
      }
    }

    return newPayment as Payment;
  }

  findAll(): Payment[] {
    return this.payments;
  }

  findOne(id: string): Payment | undefined {
    return this.payments.find((p) => p.id === id);
  }

  update(id: string, updatePaymentDto: any): Payment | undefined {
    const paymentIndex = this.payments.findIndex((p) => p.id === id);
    if (paymentIndex === -1) return undefined;
    const paidAtValue = updatePaymentDto.paid_at
      ? (updatePaymentDto.paid_at instanceof Date
        ? updatePaymentDto.paid_at
        : new Date(updatePaymentDto.paid_at))
      : this.payments[paymentIndex].paid_at;
    const updatedPayment: Payment = {
      ...this.payments[paymentIndex],
      ...updatePaymentDto,
      paid_at: paidAtValue,
      updated_at: new Date(),
    };
    this.payments[paymentIndex] = updatedPayment;
    return updatedPayment;
  }

  remove(id: string): boolean {
    const paymentIndex = this.payments.findIndex((p) => p.id === id);
    if (paymentIndex === -1) return false;
    this.payments.splice(paymentIndex, 1);
    return true;
  }
}
