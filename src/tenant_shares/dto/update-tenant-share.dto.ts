import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantShareDto } from './create-tenant-share.dto';
import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { TenantShareStatus } from '../entities/tenant-share.entity';

export class UpdateTenantShareDto extends PartialType(CreateTenantShareDto) {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsEnum(TenantShareStatus)
  status?: TenantShareStatus;
}