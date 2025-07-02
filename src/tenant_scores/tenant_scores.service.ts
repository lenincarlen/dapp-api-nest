import { Injectable } from '@nestjs/common';
import { CreateTenantScoreDto } from './dto/create-tenant_score.dto';
import { UpdateTenantScoreDto } from './dto/update-tenant_score.dto';

@Injectable()
export class TenantScoresService {
  create(createTenantScoreDto: CreateTenantScoreDto) {
    return 'This action adds a new tenantScore';
  }

  findAll() {
    return `This action returns all tenantScores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tenantScore`;
  }

  update(id: number, updateTenantScoreDto: UpdateTenantScoreDto) {
    return `This action updates a #${id} tenantScore`;
  }

  remove(id: number) {
    return `This action removes a #${id} tenantScore`;
  }
}
