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
    const contract = await this.contractsService.create(createContractDto);
    return {
      success: true,
      data: contract,
      message: 'Contract created successfully'
    };
  }

  @Get()
  async findAll(@Query('owner_id') ownerId?: string) {
    let contracts;
    if (ownerId) {
      contracts = await this.contractsService.findByOwner(ownerId);
    } else {
      contracts = await this.contractsService.findAll();
    }
    return {
      success: true,
      data: contracts,
      message: 'Contracts retrieved successfully'
    };
  }

  @Get('tenant/:tenantId/active')
  async findActiveByTenant(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    const contract = await this.contractsService.findActiveByTenant(tenantId);
    return {
      success: true,
      data: contract,
      message: contract ? 'Active contract found' : 'No active contract found'
    };
  }

  @Get('tenant/:tenantId')
  async findByTenant(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    const contracts = await this.contractsService.findByTenant(tenantId);
    return {
      success: true,
      data: contracts,
      message: 'Tenant contracts retrieved successfully'
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const contract = await this.contractsService.findOne(id);
    return {
      success: true,
      data: contract,
      message: 'Contract retrieved successfully'
    };
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContractDto: UpdateContractDto) {
    const contract = await this.contractsService.update(id, updateContractDto);
    return {
      success: true,
      data: contract,
      message: 'Contract updated successfully'
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.contractsService.remove(id);
    return {
      success: true,
      message: 'Contract deleted successfully'
    };
  }
}
