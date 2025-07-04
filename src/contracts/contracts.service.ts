import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContractDto, ContractStatus } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contracts } from './entities/contract.entity';
import { RentsService } from '../rents/rents.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contracts)
    private contractsRepository: Repository<Contracts>,
    @Inject(forwardRef(() => RentsService))
    private rentsService: RentsService,
  ) { }

  async create(createContractDto: CreateContractDto): Promise<Contracts> {
    const newContract = this.contractsRepository.create({
      ...createContractDto,
      security_deposit: createContractDto.security_deposit ?? null,
      monthly_maintenance: createContractDto.monthly_maintenance ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedContract: Contracts = await this.contractsRepository.save(newContract);

    // Generar rentas mensuales automáticamente
    if (savedContract.status === ContractStatus.ACTIVE) {
      try {
        await this.rentsService.generateMonthlyRentsForContract(
          savedContract.id,
          savedContract.tenant_id,
          savedContract.owner_id,
          savedContract.property_id,
          savedContract.amount,
          savedContract.monthly_maintenance || 0,
          new Date(savedContract.start_date),
          12, // Generar 12 meses por defecto
        );
        console.log(`✅ Rentas mensuales generadas para el contrato ${savedContract.id}`);
      } catch (error) {
        console.error(`❌ Error generando rentas para el contrato ${savedContract.id}:`, error);
        // No lanzamos el error para no fallar la creación del contrato
      }
    }

    return savedContract;
  }

  async findAll(): Promise<Contracts[]> {
    return await this.contractsRepository.find();
  }

  async findOne(id: string): Promise<Contracts> {
    const contract = await this.contractsRepository.findOne({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID "${id}" not found`);
    }

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto): Promise<Contracts> {
    const contract = await this.findOne(id);

    const updatedContract = {
      ...contract,
      ...updateContractDto,
      security_deposit: updateContractDto.security_deposit !== undefined ? updateContractDto.security_deposit : contract.security_deposit,
      monthly_maintenance: updateContractDto.monthly_maintenance !== undefined ? updateContractDto.monthly_maintenance : contract.monthly_maintenance,
      updated_at: new Date(),
    };

    return await this.contractsRepository.save(updatedContract as Contracts);
  }

  async remove(id: string): Promise<void> {
    const contract = await this.findOne(id);
    await this.contractsRepository.remove(contract);
  }

  async findByOwner(ownerId: string): Promise<Contracts[]> {
    return await this.contractsRepository.find({
      where: { owner_id: ownerId },
    });
  }

  async findByTenant(tenantId: string): Promise<Contracts[]> {
    return await this.contractsRepository.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });
  }

  async findActiveByTenant(tenantId: string): Promise<Contracts | null> {
    const contract = await this.contractsRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE
      },
      order: { created_at: 'DESC' },
    });

    return contract || null;
  }

  async findByStatus(status: ContractStatus): Promise<Contracts[]> {
    return await this.contractsRepository.find({
      where: { status },
    });
  }
}
