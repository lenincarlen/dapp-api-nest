import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { PaymentService } from '../payments/payments.service';

@Controller('owner')
export class OwnerController {
  constructor(
    private readonly ownerService: OwnerService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOwnerDto: CreateOwnerDto) {
    return this.ownerService.create(createOwnerDto);
  }

  @Get()
  findAll() {
    return this.ownerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ownerService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ) {
    return this.ownerService.update(id, updateOwnerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // O HttpStatus.NO_CONTENT si no se devuelve nada
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ownerService.remove(id);
  }

  @Get(':id/balance')
  getBalanceAndPayments(@Param('id') id: string) {
    return this.ownerService.getBalanceAndPayments(id, this.paymentService);
  }

  @Post(':id/withdraw')
  requestWithdrawal(@Param('id') id: string, @Body('amount') amount: number) {
    return this.ownerService.requestWithdrawal(id, amount);
  }
}
