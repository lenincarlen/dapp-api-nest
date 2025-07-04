import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { ContractsModule } from './contracts/contracts.module';
import { TenantsModule } from './tenants/tenants.module';
import { OwnerModule } from './owner/owner.module';
import { RentsModule } from './rents/rents.module';
import { PropertyTypesModule } from './property_types/property_types.module';
import { CountriesModule } from './countries/countries.module';
import { PaymentModule } from './payments/payments.module';
import { OwnerEarningsModule } from './owner_earnings/owner_earnings.module';
import { PaymentMethodsModule } from './payment_methods/payment_methods.module';
import { CitiesModule } from './cities/cities.module';
import { SessionsModule } from './sessions/sessions.module';
import { BackAccountModule } from './back_account/back_account.module';
import { RoleUserModule } from './role_user/role_user.module';
import { TenantScoresModule } from './tenant_scores/tenant_scores.module';
import { TenantSharesModule } from './tenant_shares/tenant_shares.module';
// Load environment variables from .env file


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/migrations/*{.ts,.js}'],
    }),
    UsersModule,
    AuthModule,
    PropertiesModule,
    TenantsModule,
    TenantSharesModule,
    ContractsModule,
    RentsModule,
    OwnerModule,
    PropertyTypesModule,
    CountriesModule,
    PaymentModule,
    OwnerEarningsModule,
    PaymentMethodsModule,
    CitiesModule,
    SessionsModule,
    BackAccountModule,
    RoleUserModule,
    TenantScoresModule,

  ],
  providers: [],
})
export class AppModule { }
