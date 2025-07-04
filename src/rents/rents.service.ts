import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between, In } from 'typeorm';
import { CreateRentDto, RentStatus } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { Rents } from './entities/rent.entity';
import { TenantSharesService } from '../tenant_shares/tenant_shares.service';
import { TenantShareStatus } from '../tenant_shares/entities/tenant-share.entity';

@Injectable()
export class RentsService {
  constructor(
    @InjectRepository(Rents)
    private rentsRepository: Repository<Rents>,
    @Inject(forwardRef(() => TenantSharesService))
    private tenantSharesService: TenantSharesService,
  ) { }

  async create(createRentDto: CreateRentDto): Promise<Rents> {
    const newRent = this.rentsRepository.create({
      ...createRentDto,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.rentsRepository.save(newRent);
  }

  async findAll(): Promise<Rents[]> {
    return await this.rentsRepository.find();
  }

  async findOne(id: string): Promise<Rents> {
    const rent = await this.rentsRepository.findOne({
      where: { id },
    });

    if (!rent) {
      throw new NotFoundException(`Rent with ID "${id}" not found`);
    }

    return rent;
  }

  async update(id: string, updateRentDto: UpdateRentDto): Promise<Rents> {
    const rent = await this.findOne(id);

    const updatedRent = {
      ...rent,
      ...updateRentDto,
      updated_at: new Date(),
    };

    return await this.rentsRepository.save(updatedRent);
  }

  async remove(id: string): Promise<void> {
    const rent = await this.findOne(id);
    await this.rentsRepository.remove(rent);
  }

  async findByContract(contractId: string): Promise<Rents[]> {
    return await this.rentsRepository.find({
      where: { contract_id: contractId },
      order: { due_date: 'ASC' },
    });
  }

  async findByTenant(tenantId: string): Promise<Rents[]> {
    return await this.rentsRepository.find({
      where: { tenant_id: tenantId },
      order: { due_date: 'ASC' },
    });
  }

  async findByOwner(ownerId: string): Promise<Rents[]> {
    return await this.rentsRepository.find({
      where: { owner_id: ownerId },
      order: { due_date: 'ASC' },
    });
  }

  async findByStatus(status: RentStatus): Promise<Rents[]> {
    return await this.rentsRepository.find({
      where: { status },
      order: { due_date: 'ASC' },
    });
  }

  /**
   * Genera las rentas mensuales para un contrato
   */
  async generateMonthlyRentsForContract(
    contractId: string,
    tenantId: string,
    ownerId: string,
    propertyId: string,
    monthlyAmount: number,
    monthlyMaintenance: number = 0,
    startDate: Date,
    months: number = 12,
  ) {
    const rents = [];
    let dailyLateFee = monthlyAmount * 0.05; // 5% del alquiler mensual como penalización diaria

    for (let i = 0; i < months; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      dueDate.setDate(1); // Primer día del mes

      const billingCycleStart = new Date(dueDate);
      billingCycleStart.setMonth(billingCycleStart.getMonth() - 1);
      billingCycleStart.setDate(1);

      const billingCycleEnd = new Date(dueDate);
      billingCycleEnd.setDate(0); // Último día del mes anterior

      const totalDue = monthlyAmount + monthlyMaintenance;

      const rent = this.rentsRepository.create({
        contract_id: contractId,
        tenant_id: tenantId,
        owner_id: ownerId,
        property_id: propertyId,
        amount: monthlyAmount,
        monthly_maintenance: monthlyMaintenance,
        due_date: dueDate.toISOString().split('T')[0],
        status: RentStatus.PENDING,
        total_due: totalDue,
        days_until_due: this.calculateDaysUntilDue(dueDate),
        late_fees: 0,
        accumulated_balance: 0,
        billing_cycle_start: billingCycleStart,
        billing_cycle_end: billingCycleEnd,
        days_late: 0,
        daily_late_fee: dailyLateFee,
        display_amount: 0,
      });

      rents.push(rent);
    }

    const rentsToSave: Rents[] = [];
    dailyLateFee = monthlyAmount * 0.05;

    const tenantShares = await this.tenantSharesService.findAllByContract(contractId);
    const activeShares = tenantShares.filter(share => share.status === TenantShareStatus.ACTIVE);

    let mainTenantRemainingPercentage = 100;
    const coTenantRents: { tenantId: string; amount: number; monthlyMaintenance: number }[] = [];

    for (const share of activeShares) {
      if (share.coTenant && share.coTenant.id !== tenantId) { // Ensure it's a co-tenant and not the main tenant
        const coTenantAmount = monthlyAmount * (share.percentage / 100);
        const coTenantMaintenance = monthlyMaintenance * (share.percentage / 100);
        coTenantRents.push({
          tenantId: share.coTenant.id,
          amount: coTenantAmount,
          monthlyMaintenance: coTenantMaintenance,
        });
        mainTenantRemainingPercentage -= share.percentage;
      }
    }

    // Create rent for the main tenant
    for (let i = 0; i < months; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      dueDate.setDate(1);

      const billingCycleStart = new Date(dueDate);
      billingCycleStart.setMonth(billingCycleStart.getMonth() - 1);
      billingCycleStart.setDate(1);

      const billingCycleEnd = new Date(dueDate);
      billingCycleEnd.setDate(0);

      const mainTenantAmount = monthlyAmount * (mainTenantRemainingPercentage / 100);
      const mainTenantMaintenance = monthlyMaintenance * (mainTenantRemainingPercentage / 100);
      const mainTenantTotalDue = mainTenantAmount + mainTenantMaintenance;

      const mainRent = this.rentsRepository.create({
        contract_id: contractId,
        tenant_id: tenantId,
        owner_id: ownerId,
        property_id: propertyId,
        amount: mainTenantAmount,
        monthly_maintenance: mainTenantMaintenance,
        due_date: dueDate.toISOString().split('T')[0],
        status: RentStatus.PENDING,
        total_due: mainTenantTotalDue,
        days_until_due: this.calculateDaysUntilDue(dueDate),
        late_fees: 0,
        accumulated_balance: 0,
        billing_cycle_start: billingCycleStart,
        billing_cycle_end: billingCycleEnd,
        days_late: 0,
        daily_late_fee: dailyLateFee,
        display_amount: 0,
      });
      rentsToSave.push(mainRent);

      // Create rents for co-tenants
      for (const coRentInfo of coTenantRents) {
        const coRent = this.rentsRepository.create({
          contract_id: contractId,
          tenant_id: coRentInfo.tenantId,
          owner_id: ownerId,
          property_id: propertyId,
          amount: coRentInfo.amount,
          monthly_maintenance: coRentInfo.monthlyMaintenance,
          due_date: dueDate.toISOString().split('T')[0],
          status: RentStatus.PENDING,
          total_due: coRentInfo.amount + coRentInfo.monthlyMaintenance,
          days_until_due: this.calculateDaysUntilDue(dueDate),
          late_fees: 0,
          accumulated_balance: 0,
          billing_cycle_start: billingCycleStart,
          billing_cycle_end: billingCycleEnd,
          days_late: 0,
          daily_late_fee: dailyLateFee,
          display_amount: 0,
        });
        rentsToSave.push(coRent);
      }
    }

    const savedRents = await this.rentsRepository.save(rentsToSave);

    // Update next_rent_id for chaining (this might need adjustment for shared rents if they are not strictly chained)
    // For simplicity, we'll chain rents for the main tenant for now, or consider if chaining is needed for co-tenants.
    // If each tenant has their own rent chain, this logic needs to be more complex.
    // For now, assuming a single chain per contract, which might not be ideal for shared rents.
    // A better approach might be to link rents by contract and month, not necessarily a linear chain.

    return savedRents;
  }

  /**
   * Actualiza el estado de todas las rentas basado en la fecha actual
   */
  async updateRentStatuses() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // Obtener todas las rentas que no están pagadas
    const unpaidRents = await this.rentsRepository.find({
      where: {
        status: In([
          RentStatus.PENDING,
          RentStatus.DUE_SOON,
          RentStatus.DUE,
          RentStatus.LATE,
          RentStatus.OVERDUE,
        ]),
      },
    });

    for (const rent of unpaidRents) {
      const dueDate = new Date(rent.due_date);
      const daysUntilDue = this.calculateDaysUntilDue(dueDate);
      const daysLate = this.calculateDaysLate(dueDate);
      const lateFees = this.calculateLateFees(daysLate, rent.daily_late_fee);
      const newStatus = this.determineRentStatus(daysUntilDue, daysLate);

      // Calcular el balance acumulado
      const previousRent = await this.getPreviousRent(rent);
      const previousBalance = previousRent ? previousRent.accumulated_balance : 0;
      const accumulatedBalance = previousBalance + rent.total_due + lateFees;

      let displayAmount = 0;
      if (rent.paid_at) {
        displayAmount = 0;
      } else if (newStatus === RentStatus.DUE || newStatus === RentStatus.LATE || newStatus === RentStatus.OVERDUE) {
        displayAmount = accumulatedBalance;
      } else {
        displayAmount = 0;
      }

      await this.rentsRepository.update(rent.id, {
        status: newStatus,
        days_until_due: daysUntilDue,
        days_late: daysLate,
        late_fees: lateFees,
        accumulated_balance: accumulatedBalance,
        display_amount: displayAmount,
        updated_at: new Date(),
      });
    }
  }

  /**
   * Obtiene las rentas vencidas
   */
  async findOverdueRents() {
    return this.rentsRepository.find({
      where: {
        status: In([RentStatus.LATE, RentStatus.OVERDUE]),
      },
      order: { due_date: 'ASC' },
    });
  }

  /**
   * Obtiene las rentas que vencen pronto (próximos 7 días)
   */
  async findRentsDueSoon() {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return this.rentsRepository.find({
      where: {
        due_date: Between(
          today.toISOString().split('T')[0],
          sevenDaysFromNow.toISOString().split('T')[0],
        ),
        status: In([RentStatus.PENDING, RentStatus.DUE_SOON]),
      },
      order: { due_date: 'ASC' },
    });
  }

  // Métodos auxiliares privados

  private calculateDaysUntilDue(dueDate: Date): number {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  private calculateDaysLate(dueDate: Date): number {
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  private calculateLateFees(daysLate: number, dailyLateFee: number): number {
    return daysLate * dailyLateFee;
  }

  private determineRentStatus(daysUntilDue: number, daysLate: number): RentStatus {
    if (daysLate > 30) {
      return RentStatus.OVERDUE;
    } else if (daysLate > 0) {
      return RentStatus.LATE;
    } else if (daysUntilDue === 0) {
      return RentStatus.DUE;
    } else if (daysUntilDue <= 7) {
      return RentStatus.DUE_SOON;
    } else {
      return RentStatus.PENDING;
    }
  }

  private async getPreviousRent(currentRent: Rents): Promise<Rents | null> {
    if (!currentRent.next_rent_id) {
      return null;
    }

    // Buscar la renta anterior en la cadena
    const previousRent = await this.rentsRepository.findOne({
      where: { next_rent_id: currentRent.id },
    });

    return previousRent;
  }
}
