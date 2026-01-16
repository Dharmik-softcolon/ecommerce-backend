// src/services/payment.service.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export const createPaymentIntent = async (
    amount: number,
    currency: string = 'inr',
    metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to smallest currency unit (paise)
        currency,
        metadata,
    });

    return paymentIntent;
};

export const confirmPaymentIntent = async (
    paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
};

export const createRefund = async (
    paymentIntentId: string,
    amount?: number
): Promise<Stripe.Refund> => {
    const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
    };

    if (amount) {
        refundParams.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundParams);
    return refund;
};

export const constructWebhookEvent = (
    payload: string | Buffer,
    signature: string
): Stripe.Event => {
    return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
    );
};

export const getPaymentMethods = async (
    customerId: string
): Promise<Stripe.PaymentMethod[]> => {
    const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
    });

    return paymentMethods.data;
};

export const createCustomer = async (
    email: string,
    name: string
): Promise<Stripe.Customer> => {
    const customer = await stripe.customers.create({
        email,
        name,
    });

    return customer;
};