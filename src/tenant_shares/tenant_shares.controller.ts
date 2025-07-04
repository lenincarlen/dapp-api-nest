import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TenantSharesService } from './tenant_shares.service';
import { CreateTenantShareDto } from './dto/create-tenant-share.dto';
import { UpdateTenantShareDto } from './dto/update-tenant-share.dto';
import { EmailService } from '../common/services/email.service';

@Controller('tenant-shares')
export class TenantSharesController {
  constructor(
    private readonly tenantSharesService: TenantSharesService,
    private readonly emailService: EmailService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTenantShareDto: CreateTenantShareDto) {
    return this.tenantSharesService.create(createTenantShareDto);
  }

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  async testEmail() {
    try {
      console.log('🧪 Testing email service...');
      await this.emailService.sendEmail(
        'test@example.com',
        'Test Email',
        '<p>This is a test email to verify the email service is working.</p>'
      );
      return {
        success: true,
        message: 'Test email sent successfully'
      };
    } catch (error) {
      console.error('❌ Test email failed:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  @Get('contract/:contractId')
  findAllByContract(@Param('contractId') contractId: string) {
    return this.tenantSharesService.findAllByContract(contractId);
  }

  @Get('email/:email')
  findByInvitedEmail(@Param('email') email: string) {
    return this.tenantSharesService.findByInvitedEmail(email);
  }

  @Get('co-tenant/:coTenantId')
  findByCoTenantId(@Param('coTenantId') coTenantId: string) {
    return this.tenantSharesService.findByCoTenantId(coTenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantSharesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantShareDto: UpdateTenantShareDto) {
    return this.tenantSharesService.update(id, updateTenantShareDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tenantSharesService.remove(id);
  }
}