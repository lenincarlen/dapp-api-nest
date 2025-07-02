import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum RentStatus {
  PENDING = 'pending',
  DUE_SOON = 'due_soon',
  DUE = 'due',
  LATE = 'late',
  OVERDUE = 'overdue',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  CANCELLED = 'cancelled'
}

export class CreateRentDto {
  @IsNotEmpty()
  @IsString()
  contract_id: string;

  @IsNotEmpty()
  @IsString()
  tenant_id: string;

  @IsNotEmpty()
  @IsString()
  owner_id: string;

  @IsNotEmpty()
  @IsString()
  property_id: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  monthly_maintenance?: number;

  @IsNotEmpty()
  @IsDateString()
  due_date: string;

  @IsOptional()
  @IsDateString()
  paid_at?: string;

  @IsOptional()
  @IsEnum(RentStatus)
  status?: RentStatus;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  previous_balance?: number;

  @IsOptional()
  @IsNumber()
  total_due?: number;

  // Nuevos campos para el sistema de facturación
  @IsOptional()
  @IsNumber()
  days_until_due?: number;

  @IsOptional()
  @IsNumber()
  late_fees?: number;

  @IsOptional()
  @IsNumber()
  accumulated_balance?: number;

  @IsOptional()
  @IsString()
  next_rent_id?: string;

  @IsOptional()
  @IsDateString()
  billing_cycle_start?: string;

  @IsOptional()
  @IsDateString()
  billing_cycle_end?: string;

  @IsOptional()
  @IsNumber()
  days_late?: number;

  @IsOptional()
  @IsNumber()
  daily_late_fee?: number;
}