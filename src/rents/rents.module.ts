import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RentsService } from './rents.service';
import { RentsController } from './rents.controller';
import { Rents } from './entities/rent.entity';
import { RentsCronService } from './rents-cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rents]),
    ScheduleModule.forRoot(),
  ],
  controllers: [RentsController],
  providers: [RentsService, RentsCronService],
  exports: [RentsService],
})
export class RentsModule { }
