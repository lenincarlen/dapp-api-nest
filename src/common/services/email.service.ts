import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly verifiedEmail = 'leninmejiacarlen@gmail.com'; // Email verificado en Resend
  private readonly verifiedDomain = 'roomer.info';

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    console.log('📧 EmailService initialized with domain:', this.verifiedDomain);
    console.log('📧 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('📧 NODE_ENV:', process.env.NODE_ENV);
    console.log('📧 VERIFIED_DOMAIN:', process.env.VERIFIED_DOMAIN);
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      console.log('📧 Attempting to send email to:', to);
      console.log('📧 Subject:', subject);

      // Verificar si estamos en producción con dominio verificado
      const isProduction = process.env.NODE_ENV === 'production' && process.env.VERIFIED_DOMAIN;
      console.log('📧 Is production mode:', isProduction);

      if (isProduction) {
        // En producción, enviar normalmente con el dominio verificado
        console.log('📧 Sending production email from:', `noreply@${this.verifiedDomain}`);

        const result = await this.resend.emails.send({
          from: `noreply@${this.verifiedDomain}`,
          to,
          subject,
          html,
        });

        console.log('📧 Production email sent successfully:', result);
        console.log(`📧 Email enviado a ${to} desde ${this.verifiedDomain}`);
      } else {
        // En desarrollo o sin dominio verificado, usar modo de prueba
        console.log('📧 Sending test email to verified address:', this.verifiedEmail);

        const testHtml = `
          <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #F59E0B;">
            <h3 style="color: #D97706; margin-top: 0;">🚧 MODO DE PRUEBA</h3>
            <p><strong>Destinatario real:</strong> ${to}</p>
            <p>Este email se envió a la dirección verificada porque Resend está en modo de prueba.</p>
          </div>
          ${html}
        `;

        const result = await this.resend.emails.send({
          from: 'onboarding@resend.dev',
          to: this.verifiedEmail,
          subject: `[PRUEBA] ${subject}`,
          html: testHtml,
        });

        console.log('📧 Test email sent successfully:', result);
        console.log(`📧 Email de prueba enviado a ${this.verifiedEmail} (destinatario real: ${to})`);
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      console.error('❌ Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        name: error.name,
        stack: error.stack
      });

      // No lanzar el error para no fallar la operación principal
      // pero loguear para debugging
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Envía credenciales de inquilino por email
   */
  async sendTenantCredentials(
    email: string,
    tenantName: string,
    username: string,
    password: string,
  ): Promise<void> {
    try {
      console.log('📧 Enviando credenciales a:', email);

      const emailData = {
        to: email,
        from: 'noreply@roomer.info',
        subject: 'Bienvenido a Roomer - Tus Credenciales de Acceso',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background-color: #000000; color: #ffffff; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Roomer</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Gestión de Propiedades</p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px; background-color: #ffffff;">
              <h2 style="color: #000000; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                ¡Bienvenido, ${tenantName}!
              </h2>
              
              <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Tu cuenta ha sido creada exitosamente. Aquí tienes tus credenciales de acceso:
              </p>

              <!-- Credentials Card -->
              <div style="background-color: #f3f4f6; padding: 24px; border-radius: 12px; margin: 24px 0;">
                <h3 style="color: #000000; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                  Credenciales de Acceso
                </h3>
                
                <div style="margin-bottom: 16px;">
                  <label style="display: block; color: #000000; font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                    Email:
                  </label>
                  <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <span style="color: #000000; font-family: 'Courier New', monospace; font-size: 14px;">${username}</span>
                  </div>
                </div>

                <div style="margin-bottom: 16px;">
                  <label style="display: block; color: #000000; font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                    Contraseña:
                  </label>
                  <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <span style="color: #000000; font-family: 'Courier New', monospace; font-size: 14px;">${password}</span>
                  </div>
                </div>

                <div style="background-color: #11b981; color: #ffffff; padding: 12px; border-radius: 8px; text-align: center; margin-top: 16px;">
                  <strong>¡Importante!</strong> Guarda estas credenciales en un lugar seguro.
                </div>
              </div>

              <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                Ya puedes acceder a tu cuenta y gestionar tus rentas desde la aplicación móvil de Roomer.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="#" style="background-color: #11b981; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block;">
                  Acceder a Roomer
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #000000; font-size: 14px; margin: 0 0 8px 0;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
              <p style="color: #000000; font-size: 12px; margin: 0; opacity: 0.7;">
                © 2024 Roomer. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      console.log('📧 Email de credenciales - Datos:', {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject
      });

      const result = await this.resend.emails.send(emailData);
      console.log('✅ Email de credenciales enviado exitosamente:', result);
    } catch (error) {
      console.error('❌ Error enviando email de credenciales:', error);
      throw error;
    }
  }

  /**
   * Envía invitación de tenant share por email
   */
  async sendTenantShareInvitation(
    email: string,
    tenantName: string,
    mainTenantName: string,
    rentAmount: number,
    percentage: number,
    startDate: string,
    endDate: string,
    username: string,
    password: string,
  ): Promise<void> {
    try {
      console.log('📧 Enviando invitación de tenant share a:', email);

      const formattedAmount = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
      }).format(rentAmount);

      const formattedPercentage = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
      }).format(rentAmount * (percentage / 100));

      const emailData = {
        to: email,
        from: 'noreply@roomer.info',
        subject: `Invitación para compartir renta - ${mainTenantName}`,
        html: `
         
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación para Compartir Renta</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f6f6;">
    
    <!-- Email Container -->
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="padding: 32px 24px; border-bottom: 1px solid #e5e5e5;">
            <div style="display: flex; align-items: center; margin-bottom: 24px;">
                <div style="width: 40px; height: 40px; background-color: #000000; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                    <span style="color: #ffffff; font-size: 18px; font-weight: 600;">R</span>
                </div>
                <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #000000;">Rentalia</h1>
            </div>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 32px 24px;">
            
            <!-- Title -->
            <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #000000; line-height: 1.2;">
                Invitación para compartir renta
            </h2>
            
            <!-- Subtitle -->
            <p style="margin: 0 0 32px 0; font-size: 16px; color: #6b7280; line-height: 1.4;">
                ${mainTenantName} te ha invitado a compartir los gastos de renta
            </p>
            
            <!-- Main Info Card -->
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                
                <!-- Amount Section -->
                <div style="text-align: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280; font-weight: 500;">
                        Tu pago mensual
                    </p>
                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: #000000;">
                        $${((rentAmount * percentage) / 100).toFixed(2)}
                    </p>
                </div>
                
                <!-- Details Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div>
                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280; font-weight: 500;">
                            Renta total
                        </p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">
                            $${rentAmount}
                        </p>
                    </div>
                    <div>
                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280; font-weight: 500;">
                            Tu porcentaje
                        </p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">
                            ${percentage}%
                        </p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280; font-weight: 500;">
                            Inicio
                        </p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">
                            ${new Date(startDate).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                        </p>
                    </div>
                    <div>
                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280; font-weight: 500;">
                            Fin
                        </p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">
                            ${new Date(endDate).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Credentials Section -->
            <div style="margin-bottom: 32px;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #000000;">
                    Tus credenciales de acceso
                </h3>
                
                <!-- Email -->
                <div style="margin-bottom: 16px;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280; font-weight: 500;">
                        Email
                    </p>
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px;">
                        <p style="margin: 0; font-size: 16px; font-weight: 500; color: #000000; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;">
                            ${email}
                        </p>
                    </div>
                </div>
                
                <!-- Password -->
                <div style="margin-bottom: 16px;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280; font-weight: 500;">
                        Contraseña temporal
                    </p>
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px;">
                        <p style="margin: 0; font-size: 16px; font-weight: 500; color: #000000; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;">
                            ${password}
                        </p>
                    </div>
                </div>
                
                <!-- Security Note -->
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 500;">
                        ⚠️ Cambia tu contraseña después del primer inicio de sesión
                    </p>
                </div>
            </div>
            
            <!-- CTA Button -->
            <div style="margin-bottom: 32px;">
                <a href="#" style="display: block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; width: 100%; box-sizing: border-box;">
                    Iniciar sesión
                </a>
            </div>
            
            <!-- Features -->
            <div style="margin-bottom: 32px;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #000000;">
                    Con tu cuenta puedes:
                </h3>
                
                <div style="space-y: 12px;">
                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                        <div style="width: 20px; height: 20px; background-color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px; flex-shrink: 0;">
                            <span style="color: #ffffff; font-size: 12px; font-weight: 600;">✓</span>
                        </div>
                        <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.4;">
                            Ver detalles de tu contrato compartido
                        </p>
                    </div>
                    
                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                        <div style="width: 20px; height: 20px; background-color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px; flex-shrink: 0;">
                            <span style="color: #ffffff; font-size: 12px; font-weight: 600;">✓</span>
                        </div>
                        <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.4;">
                            Gestionar tus pagos de renta
                        </p>
                    </div>
                    
                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                        <div style="width: 20px; height: 20px; background-color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px; flex-shrink: 0;">
                            <span style="color: #ffffff; font-size: 12px; font-weight: 600;">✓</span>
                        </div>
                        <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.4;">
                            Comunicarte con ${mainTenantName}
                        </p>
                    </div>
                    
                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                        <div style="width: 20px; height: 20px; background-color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px; flex-shrink: 0;">
                            <span style="color: #ffffff; font-size: 12px; font-weight: 600;">✓</span>
                        </div>
                        <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.4;">
                            Acceder a documentos del contrato
                        </p>
                    </div>
                    
                    <div style="display: flex; align-items: flex-start;">
                        <div style="width: 20px; height: 20px; background-color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px; flex-shrink: 0;">
                            <span style="color: #ffffff; font-size: 12px; font-weight: 600;">✓</span>
                        </div>
                        <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.4;">
                            Recibir notificaciones de pagos
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Help Section -->
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #000000;">
                    ¿Necesitas ayuda?
                </p>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    Contacta a ${mainTenantName} o responde a este correo
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="padding: 24px; border-top: 1px solid #e5e5e5; background-color: #f9fafb;">
            <div style="text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #000000;">
                    Rentalia
                </p>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
                    Plataforma de gestión inmobiliaria
                </p>
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                    © 2024 Rentalia LLC
                </p>
            </div>
        </div>
    </div>
</body>
        `
      };

      console.log('📧 Email de invitación de tenant share - Datos:', {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject
      });

      const result = await this.resend.emails.send(emailData);
      console.log('✅ Email de invitación de tenant share enviado exitosamente:', result);
    } catch (error) {
      console.error('❌ Error enviando email de invitación de tenant share:', error);
      throw error;
    }
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

  /**
   * Envía un email de prueba para verificar la configuración
   */
  async sendTestEmail(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📧 Enviando email de prueba...');

      // Usar un email real para las pruebas
      const testEmail = 'l.mejia32@unapec.edu.do'; // Email real para pruebas

      const emailData = {
        to: testEmail,
        from: 'noreply@roomer.info',
        subject: 'Test Email - Roomer App',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background-color: #000000; color: #ffffff; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Roomer</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Test de Configuración</p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px; background-color: #ffffff;">
              <h2 style="color: #000000; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                Test de Email Exitoso
              </h2>
              
              <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Este es un email de prueba para verificar que el servicio de email está funcionando correctamente.
              </p>

              <!-- Test Info Card -->
              <div style="background-color: #f3f4f6; padding: 24px; border-radius: 12px; margin: 24px 0;">
                <h3 style="color: #000000; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                  Información del Test
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <label style="display: block; color: #000000; font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                      Timestamp:
                    </label>
                    <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
                      <span style="color: #000000; font-size: 14px;">${new Date().toISOString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label style="display: block; color: #000000; font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                      Servidor:
                    </label>
                    <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
                      <span style="color: #11b981; font-size: 14px; font-weight: 600;">${process.env.NODE_ENV || 'development'}</span>
                    </div>
                  </div>
                </div>

                <div style="background-color: #11b981; color: #ffffff; padding: 12px; border-radius: 8px; text-align: center; margin-top: 16px;">
                  <strong>¡Éxito!</strong> La configuración de Resend está funcionando correctamente.
                </div>
              </div>

              <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                Si recibes este email, significa que la configuración de Resend está funcionando correctamente.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #000000; font-size: 14px; margin: 0 0 8px 0;">
                Este es un email de prueba automático.
              </p>
              <p style="color: #000000; font-size: 12px; margin: 0; opacity: 0.7;">
                © 2024 Roomer. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      console.log('📧 Email de prueba - Datos:', {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject
      });

      const result = await this.resend.emails.send(emailData);

      console.log('✅ Email de prueba enviado exitosamente:', result);

      return {
        success: true,
        message: `Email de prueba enviado exitosamente a ${testEmail}`
      };
    } catch (error) {
      console.error('❌ Error enviando email de prueba:', error);
      return {
        success: false,
        message: `Error enviando email de prueba: ${error.message}`
      };
    }
  }
} 