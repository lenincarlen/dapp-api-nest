import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TenantScoresService } from './tenant_scores.service';
import { CreateTenantScoreDto } from './dto/create-tenant_score.dto';
import { UpdateTenantScoreDto } from './dto/update-tenant_score.dto';

@Controller('tenant-scores')
export class TenantScoresController {
  constructor(private readonly tenantScoresService: TenantScoresService) {}

  @Post()
  create(@Body() createTenantScoreDto: CreateTenantScoreDto) {
    return this.tenantScoresService.create(createTenantScoreDto);
  }

  @Get()
  findAll() {
    return this.tenantScoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantScoresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantScoreDto: UpdateTenantScoreDto) {
    return this.tenantScoresService.update(+id, updateTenantScoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantScoresService.remove(+id);
  }
}
