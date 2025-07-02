import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RentsService } from './rents.service';

@Injectable()
export class RentsCronService {
    private readonly logger = new Logger(RentsCronService.name);

    constructor(private readonly rentsService: RentsService) { }

    /**
     * Actualiza los estados de las rentas diariamente a las 6:00 AM
     */
    @Cron('0 6 * * *') // 6:00 AM daily
    async handleDailyRentStatusUpdate() {
        this.logger.log('Iniciando actualización diaria de estados de rentas...');

        try {
            await this.rentsService.updateRentStatuses();
            this.logger.log('Actualización diaria de estados de rentas completada');
        } catch (error) {
            this.logger.error('Error al actualizar estados de rentas:', error);
        }
    }

    /**
     * Envía notificaciones de rentas que vencen pronto (cada 6 horas)
     */
    @Cron('0 */6 * * *')
    async handleRentDueSoonNotifications() {
        this.logger.log('Verificando rentas que vencen pronto...');

        try {
            const rentsDueSoon = await this.rentsService.findRentsDueSoon();

            if (rentsDueSoon.length > 0) {
                this.logger.log(`Encontradas ${rentsDueSoon.length} rentas que vencen pronto`);
                // Aquí se implementaría la lógica de notificaciones
                // await this.notificationService.sendRentDueSoonNotifications(rentsDueSoon);
            }
        } catch (error) {
            this.logger.error('Error al verificar rentas que vencen pronto:', error);
        }
    }

    /**
     * Envía notificaciones de rentas vencidas (cada 12 horas)
     */
    @Cron('0 */12 * * *')
    async handleOverdueRentNotifications() {
        this.logger.log('Verificando rentas vencidas...');

        try {
            const overdueRents = await this.rentsService.findOverdueRents();

            if (overdueRents.length > 0) {
                this.logger.log(`Encontradas ${overdueRents.length} rentas vencidas`);
                // Aquí se implementaría la lógica de notificaciones
                // await this.notificationService.sendOverdueRentNotifications(overdueRents);
            }
        } catch (error) {
            this.logger.error('Error al verificar rentas vencidas:', error);
        }
    }

    /**
     * Genera reportes semanales de rentas (cada domingo a las 8:00 AM)
     */
    @Cron('0 8 * * 0')
    async handleWeeklyRentReports() {
        this.logger.log('Generando reporte semanal de rentas...');

        try {
            // Aquí se implementaría la lógica de reportes
            // await this.reportService.generateWeeklyRentReport();
            this.logger.log('Reporte semanal de rentas generado');
        } catch (error) {
            this.logger.error('Error al generar reporte semanal de rentas:', error);
        }
    }

    /**
     * Limpia rentas antiguas (cada mes)
     */
    @Cron('0 2 1 * *')
    async handleMonthlyRentCleanup() {
        this.logger.log('Iniciando limpieza mensual de rentas...');

        try {
            // Aquí se implementaría la lógica de limpieza
            // await this.rentsService.cleanupOldRents();
            this.logger.log('Limpieza mensual de rentas completada');
        } catch (error) {
            this.logger.error('Error en la limpieza mensual de rentas:', error);
        }
    }
} 