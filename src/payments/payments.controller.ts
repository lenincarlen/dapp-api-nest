import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { StripeService } from './stripe.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
  ) { }

  @Post('create-customer')
  async createStripeCustomer(@Body() body: { email: string; name: string }) {
    console.log('🚀 === PETICIÓN RECIBIDA EN CREATE-CUSTOMER ===');
    console.log('🔍 Creando customer de Stripe con:', body);

    const stripe = this.stripeService.getStripe();
    console.log('🔍 Stripe disponible:', !!stripe);

    if (!stripe) {
      console.error('❌ Stripe no está configurado');
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    try {
      // Busca si ya existe un customer con ese email (opcional, Stripe no lo impide)
      // Lo ideal es guardar el customerId en tu base de datos de usuarios
      console.log('🔍 Creando customer en Stripe...');
      const customer = await stripe.customers.create({
        email: body.email,
        name: body.name,
      });
      console.log('✅ Customer creado exitosamente:', customer.id);
      return { customerId: customer.id };
    } catch (error) {
      console.error('❌ Error creando customer:', error);
      throw new BadRequestException(`Error creating customer: ${error.message}`);
    }
  }

  @Post('create-setup-intent')
  async createSetupIntent(@Body() body: { customerId: string }) {
    const stripe = this.stripeService.getStripe();
    if (!stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: body.customerId,
      payment_method_types: ['card'],
    });
    console.log('🔑 setupIntent.client_secret:', setupIntent.client_secret);
    return { clientSecret: setupIntent.client_secret };
  }

  @Post('pay-rent')
  async payRent(@Body() body: { customerId: string; paymentMethodId: string; amount: number; currency: string }) {
    const stripe = this.stripeService.getStripe();
    if (!stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    // Crea el PaymentIntent usando el método guardado
    const paymentIntent = await stripe.paymentIntents.create({
      customer: body.customerId,
      payment_method: body.paymentMethodId,
      amount: Math.round(body.amount * 100), // Stripe usa centavos
      currency: body.currency,
      confirm: true,
      off_session: true, // Permite cobro sin interacción
    });
    return { paymentIntentId: paymentIntent.id, status: paymentIntent.status };
  }

  @Get('customer/:customerId/payment-methods')
  async getCustomerPaymentMethods(@Param('customerId') customerId: string) {
    const stripe = this.stripeService.getStripe();
    if (!stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        } : null,
        billing_details: pm.billing_details ? {
          name: pm.billing_details.name,
          email: pm.billing_details.email,
        } : null,
      }));
    } catch (error) {
      throw new BadRequestException('Error retrieving payment methods');
    }
  }

  @Delete('payment-methods/:paymentMethodId')
  async detachPaymentMethod(@Param('paymentMethodId') paymentMethodId: string) {
    const stripe = this.stripeService.getStripe();
    if (!stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    try {
      await stripe.paymentMethods.detach(paymentMethodId);
      return { success: true, message: 'Payment method detached successfully' };
    } catch (error) {
      throw new BadRequestException('Error detaching payment method');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentService.remove(id);
  }
}
