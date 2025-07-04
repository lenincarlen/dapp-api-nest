import { IsUUID, IsEmail, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { TenantShareStatus } from '../entities/tenant-share.entity';

export class CreateTenantShareDto {
  @IsUUID()
  contract_id: string;

  @IsUUID()
  main_tenant_id: string;

  @IsOptional()
  @IsUUID()
  co_tenant_id?: string;

  @IsOptional()
  @IsEmail()
  invitedEmail?: string;

  @IsNumber()
  @Min(0.01)
  @Max(100)
  percentage: number;

  @IsOptional()
  @IsEnum(TenantShareStatus)
  status?: TenantShareStatus;
}