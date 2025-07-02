import { PartialType } from '@nestjs/swagger';
import { CreateBackAccountDto } from './create-back_account.dto';

export class UpdateBackAccountDto extends PartialType(CreateBackAccountDto) {}
