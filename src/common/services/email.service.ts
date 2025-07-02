import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(to: string, subject: string, html: string) {
    await this.resend.emails.send({
      from: 'onboarding@resend.dev', // Remitente temporal de pruebas
      to,
      subject,
      html,
    });
  }

  /**
   * Envía credenciales de acceso a un nuevo inquilino
   */
  async sendTenantCredentials(to: string, name: string, email: string, password: string) {
    const subject = 'Tus credenciales de acceso a la plataforma';
    const html = `<p>Hola <b>${name}</b>,<br/><br/>
      Se ha creado tu cuenta de inquilino en la plataforma.<br/>
      <b>Usuario:</b> ${email}<br/>
      <b>Contraseña:</b> ${password}<br/><br/>
      Puedes iniciar sesión en: <a href="https://tudominio.com/login">https://tudominio.com/login</a><br/><br/>
      Si tienes dudas, responde a este correo.<br/><br/>
      Saludos,<br/>El equipo de la plataforma
    </p>`;
    await this.sendEmail(to, subject, html);
  }

  /**
   * Envía notificación de renta vencida
   */
  async sendRentOverdueNotification(
    tenantEmail: string,
    tenantName: string,
    rentAmount: number,
    daysLate: number,
    dueDate: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'tu-email@gmail.com',
        to: tenantEmail,
        subject: 'Renta Vencida - Acción Requerida',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #EF4444; color: white; padding: 20px; text-align: center;">
              <h1>Renta Vencida</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hola ${tenantName},</h2>
              
              <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #DC2626; margin-top: 0;">Tu renta está vencida</h3>
                
                <div style="margin: 15px 0;">
                  <strong>Monto vencido:</strong> $${rentAmount}
                </div>
                
                <div style="margin: 15px 0;">
                  <strong>Fecha de vencimiento:</strong> ${dueDate}
                </div>
                
                <div style="margin: 15px 0;">
                  <strong>Días de atraso:</strong> ${daysLate} días
                </div>
              </div>
              
              <p>Por favor, realiza el pago lo antes posible para evitar penalizaciones adicionales.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/screens/inquilino/MyRentsScreen" 
                   style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Pagar Ahora
                </a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px;">
                Si tienes alguna pregunta sobre tu renta, contacta a tu propietario.
              </p>
            </div>
            
            <div style="background-color: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
              © 2024 DApp - Plataforma de Gestión Inmobiliaria
            </div>
          </div>
        `,
      };

      await this.resend.emails.send(mailOptions);
      console.log(`✅ Notificación de renta vencida enviada a ${tenantEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ Error enviando notificación de renta vencida a ${tenantEmail}:`, error);
      return false;
    }
  }

  /**
   * Envía notificación de renta próxima a vencer
   */
  async sendRentDueSoonNotification(
    tenantEmail: string,
    tenantName: string,
    rentAmount: number,
    dueDate: string,
    daysUntilDue: number,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'tu-email@gmail.com',
        to: tenantEmail,
        subject: 'Recordatorio: Renta próxima a vencer',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #F59E0B; color: white; padding: 20px; text-align: center;">
              <h1>Recordatorio de Renta</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hola ${tenantName},</h2>
              
              <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #D97706; margin-top: 0;">Tu renta vence pronto</h3>
                
                <div style="margin: 15px 0;">
                  <strong>Monto a pagar:</strong> $${rentAmount}
                </div>
                
                <div style="margin: 15px 0;">
                  <strong>Fecha de vencimiento:</strong> ${dueDate}
                </div>
                
                <div style="margin: 15px 0;">
                  <strong>Días restantes:</strong> ${daysUntilDue} días
                </div>
              </div>
              
              <p>Te recordamos que tu renta vence en ${daysUntilDue} días. Realiza el pago a tiempo para evitar penalizaciones.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/screens/inquilino/MyRentsScreen" 
                   style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Pagar Ahora
                </a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px;">
                Gracias por tu puntualidad en los pagos.
              </p>
            </div>
            
            <div style="background-color: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
              © 2024 DApp - Plataforma de Gestión Inmobiliaria
            </div>
          </div>
        `,
      };

      await this.resend.emails.send(mailOptions);
      console.log(`✅ Recordatorio de renta enviado a ${tenantEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ Error enviando recordatorio de renta a ${tenantEmail}:`, error);
      return false;
    }
  }
} 