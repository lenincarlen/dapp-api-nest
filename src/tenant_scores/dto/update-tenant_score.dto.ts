import { PartialType } from '@nestjs/swagger';
import { CreateTenantScoreDto } from './create-tenant_score.dto';

export class UpdateTenantScoreDto extends PartialType(CreateTenantScoreDto) {}
