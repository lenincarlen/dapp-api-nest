import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe | null = null;

    constructor() {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (stripeKey) {
            this.stripe = new Stripe(stripeKey);
        } else {
            console.warn('STRIPE_SECRET_KEY not found in environment variables. Stripe functionality will be disabled.');
        }
    }

    getStripe(): Stripe | null {
        return this.stripe;
    }

    isStripeAvailable(): boolean {
        return this.stripe !== null;
    }
} 