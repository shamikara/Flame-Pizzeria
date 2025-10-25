import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export const formatAmountForStripe = (amount: number, currency: string = 'lkr'): number => {
  // Stripe expects amounts in the smallest currency unit (cents for USD, paisa for LKR)
  // LKR uses 2 decimal places like most currencies
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number, currency: string = 'lkr'): number => {
  return amount / 100;
};
