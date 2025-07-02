import { Module } from '@nestjs/common';
import { BackAccountService } from './back_account.service';
import { BackAccountController } from './back_account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackAccount } from './entities/back_account.entity';

@Module({

  imports: [TypeOrmModule.forFeature([BackAccount])],
  controllers: [BackAccountController],
  providers: [BackAccountService],
  exports: [BackAccountService]
})
export class BackAccountModule {}
