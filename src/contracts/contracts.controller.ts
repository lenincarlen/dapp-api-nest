import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContractDto: CreateContractDto) {
    return await this.contractsService.create(createContractDto);
  }

  @Get()
  async findAll(@Query('owner_id') ownerId?: string) {
    if (ownerId) {
      return await this.contractsService.findByOwner(ownerId);
    }
    return await this.contractsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.contractsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContractDto: UpdateContractDto) {
    return await this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.contractsService.remove(id);
  }
}
