import { Module } from '@nestjs/common';
import { TenantScoresService } from './tenant_scores.service';
import { TenantScoresController } from './tenant_scores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantScore } from './entities/tenant_score.entity';

@Module({

  imports:[TypeOrmModule.forFeature([TenantScore])],
  controllers: [TenantScoresController],
  providers: [TenantScoresService],
  exports:[TenantScoresService]
})
export class TenantScoresModule {}
