import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantShare, TenantShareStatus } from './entities/tenant-share.entity';
import { CreateTenantShareDto } from './dto/create-tenant-share.dto';
import { UpdateTenantShareDto } from './dto/update-tenant-share.dto';
import { ContractsService } from '../contracts/contracts.service';
import { TenantsService } from '../tenants/tenants.service';
import { EmailService } from '../common/services/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantSharesService {
  constructor(
    @InjectRepository(TenantShare)
    private tenantShareRepository: Repository<TenantShare>,
    @Inject(forwardRef(() => ContractsService))
    private contractsService: ContractsService,
    private tenantsService: TenantsService,
    private emailService: EmailService,
  ) { }

  async create(createTenantShareDto: CreateTenantShareDto): Promise<TenantShare> {
    const { contract_id, main_tenant_id, co_tenant_id, invitedEmail, percentage } = createTenantShareDto;

    console.log('🔍 Creating tenant share with data:', createTenantShareDto);

    const contract = await this.contractsService.findOne(contract_id);
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contract_id} not found`);
    }

    const mainTenant = await this.tenantsService.findOneWithoutOwnerCheck(main_tenant_id);
    if (!mainTenant) {
      throw new NotFoundException(`Main Tenant with ID ${main_tenant_id} not found`);
    }

    if (co_tenant_id) {
      const coTenant = await this.tenantsService.findOneWithoutOwnerCheck(co_tenant_id);
      if (!coTenant) {
        throw new NotFoundException(`Co-Tenant with ID ${co_tenant_id} not found`);
      }
    }

    await this.validatePercentage(contract_id, percentage);

    // Si se proporciona un email de invitación, crear usuario y tenant automáticamente
    let newCoTenantId = co_tenant_id;
    if (invitedEmail && !co_tenant_id) {
      console.log('📧 Creating tenant for invitation with email:', invitedEmail);
      try {
        // Crear tenant automáticamente para el email invitado
        const newTenant = await this.tenantsService.createTenantForInvitation(
          invitedEmail,
          mainTenant.owner_id
        );
        newCoTenantId = newTenant.id;
        console.log('✅ Tenant created successfully:', newTenant.id);

        // Enviar correo con credenciales y detalles de la renta
        console.log('📧 Sending invitation email...');
        await this.sendTenantShareInvitation(
          invitedEmail,
          mainTenant.name,
          contract,
          percentage,
          newTenant
        );
      } catch (error) {
        console.error('❌ Error creating tenant for invitation:', error);
        // Si falla la creación del tenant, continuar con la invitación pendiente
      }
    } else {
      console.log('📧 No email invitation or co_tenant_id provided, skipping email sending');
    }

    const newTenantShare = this.tenantShareRepository.create({
      contract_id,
      main_tenant_id,
      co_tenant_id: newCoTenantId,
      invitedEmail: newCoTenantId ? null : invitedEmail, // Limpiar email si ya se creó el tenant
      percentage,
      status: newCoTenantId ? TenantShareStatus.ACTIVE : TenantShareStatus.PENDING_INVITE,
    });

    const savedTenantShare = await this.tenantShareRepository.save(newTenantShare);
    console.log('✅ Tenant share created successfully:', savedTenantShare.id);

    return savedTenantShare;
  }

  async findAllByContract(contractId: string): Promise<TenantShare[]> {
    return this.tenantShareRepository.find({
      where: { contract_id: contractId },
      relations: ['mainTenant', 'coTenant', 'contract'],
    });
  }

  async findOne(id: string): Promise<TenantShare> {
    const tenantShare = await this.tenantShareRepository.findOne({
      where: { id },
      relations: ['contract', 'mainTenant', 'coTenant'],
    });
    if (!tenantShare) {
      throw new NotFoundException(`TenantShare with ID ${id} not found`);
    }
    return tenantShare;
  }

  async findByInvitedEmail(email: string): Promise<TenantShare | undefined> {
    return this.tenantShareRepository.findOne({
      where: { invitedEmail: email },
      relations: ['contract', 'mainTenant', 'coTenant'],
    });
  }

  async findByCoTenantId(coTenantId: string): Promise<TenantShare[]> {
    return this.tenantShareRepository.find({
      where: { co_tenant_id: coTenantId },
      relations: ['contract', 'mainTenant', 'coTenant'],
    });
  }

  async update(id: string, updateTenantShareDto: UpdateTenantShareDto): Promise<TenantShare> {
    const tenantShare = await this.findOne(id);
    const { percentage, co_tenant_id } = updateTenantShareDto;

    if (percentage !== undefined) {
      await this.validatePercentage(tenantShare.contract_id, percentage, id);
    }

    if (co_tenant_id && !tenantShare.co_tenant_id) {
      const coTenant = await this.tenantsService.findOneWithoutOwnerCheck(co_tenant_id);
      if (!coTenant) {
        throw new NotFoundException(`Co-Tenant with ID ${co_tenant_id} not found`);
      }
      updateTenantShareDto.status = TenantShareStatus.ACTIVE;
    }

    this.tenantShareRepository.merge(tenantShare, updateTenantShareDto);
    return this.tenantShareRepository.save(tenantShare);
  }

  async remove(id: string): Promise<TenantShare> {
    const tenantShare = await this.findOne(id);
    const contractId = tenantShare.contract_id;
    await this.tenantShareRepository.remove(tenantShare);

    // After removing a share, recalculate percentages for the main tenant
    // This assumes the main tenant's share is implicitly 100% minus co-tenant shares.
    // No explicit update needed for other shares unless percentages were fixed.
    // The rent generation logic will handle the main tenant's percentage based on active shares.

    return tenantShare;
  }

  private async validatePercentage(contractId: string, newPercentage: number, currentShareId?: string): Promise<void> {
    const existingShares = await this.tenantShareRepository.find({
      where: { contract_id: contractId, status: TenantShareStatus.ACTIVE },
    });

    let totalPercentage = existingShares.reduce((sum, share) => {
      if (share.id === currentShareId) {
        return sum + newPercentage; // Use new percentage for the current share being updated
      }
      return sum + share.percentage;
    }, 0);

    // If adding a new share, include its percentage
    if (!currentShareId) {
      totalPercentage += newPercentage;
    }

    if (totalPercentage > 100) {
      throw new BadRequestException(`Total percentage for contract ${contractId} exceeds 100%. Current total: ${totalPercentage}%`);
    }
  }

  async updateCoTenantId(invitedEmail: string, coTenantId: string): Promise<TenantShare | null> {
    const tenantShare = await this.tenantShareRepository.findOne({
      where: { invitedEmail, status: TenantShareStatus.PENDING_INVITE },
    });

    if (tenantShare) {
      tenantShare.co_tenant_id = coTenantId;
      tenantShare.status = TenantShareStatus.ACTIVE;
      tenantShare.invitedEmail = null; // Clear invited email once registered
      return this.tenantShareRepository.save(tenantShare);
    }
    return null;
  }

  private async sendTenantShareInvitation(
    email: string,
    mainTenantName: string,
    contract: any,
    percentage: number,
    newTenant: any
  ): Promise<void> {
    try {
      console.log('📧 Starting to send tenant share invitation...');
      console.log('📧 Email details:', {
        to: email,
        tenantName: newTenant.name || email,
        mainTenantName,
        rentAmount: contract.amount,
        percentage,
        startDate: contract.start_date,
        endDate: contract.end_date,
        tenantEmail: newTenant.email,
        tempPassword: newTenant.tempPassword
      });

      await this.emailService.sendTenantShareInvitation(
        email,
        newTenant.name || email,
        mainTenantName,
        contract.amount,
        percentage,
        contract.start_date,
        contract.end_date,
        newTenant.email,
        newTenant.tempPassword
      );

      console.log('✅ Email de invitación de tenant share enviado exitosamente');
    } catch (error) {
      console.error('❌ Error enviando email de invitación de tenant share:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      // No lanzamos el error para no fallar la creación del tenant share
    }
  }
}