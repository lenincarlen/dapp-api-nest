import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentMethodsService } from './payment_methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment_method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment_method.dto';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return await this.paymentMethodsService.create(createPaymentMethodDto);
  }

  @Get()
  async findAll() {
    return await this.paymentMethodsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.paymentMethodsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePaymentMethodDto: UpdatePaymentMethodDto) {
    return await this.paymentMethodsService.update(id, updatePaymentMethodDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.paymentMethodsService.remove(id);
  }
}
