import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RentsService } from './rents.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { RentStatus } from './dto/create-rent.dto';

@Controller('rents')
export class RentsController {
  constructor(private readonly rentsService: RentsService) { }

  @Post()
  create(@Body() createRentDto: CreateRentDto) {
    return this.rentsService.create(createRentDto);
  }

  @Get()
  findAll() {
    return this.rentsService.findAll();
  }

  @Get('owner/:ownerId')
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.rentsService.findByOwner(ownerId);
  }

  @Get('tenant/:tenantId')
  findByTenant(@Param('tenantId') tenantId: string) {
    return this.rentsService.findByTenant(tenantId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: RentStatus) {
    return this.rentsService.findByStatus(status);
  }

  @Get('overdue')
  findOverdue() {
    return this.rentsService.findOverdueRents();
  }

  @Get('due-soon')
  findDueSoon() {
    return this.rentsService.findRentsDueSoon();
  }

  @Get('update-statuses')
  async updateStatuses() {
    await this.rentsService.updateRentStatuses();
    return { message: 'Estados de rentas actualizados correctamente' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRentDto: UpdateRentDto) {
    return this.rentsService.update(id, updateRentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentsService.remove(id);
  }
}
