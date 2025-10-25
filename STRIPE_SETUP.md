# Stripe Configuration

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Next.js Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Setup Instructions

### 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a new account or log in to existing
3. Go to Developers > API keys
4. Copy your publishable and secret keys

### 2. Set Environment Variables
Add the keys to your `.env.local` file:

```bash
# Replace with your actual keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Make sure this matches your publishable key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Set Up Webhooks (for production)
1. Go to Developers > Webhooks in Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook secret and add to `STRIPE_WEBHOOK_SECRET`

### 4. Test the Integration
1. Submit a catering request
2. Click "Proceed to payment"
3. Complete the payment using Stripe test cards
4. Verify payment success page appears

## Test Cards
Use these Stripe test card numbers for testing:

- **Successful payment**: 4242424242424242
- **Declined payment**: 4000000000000002
- **Insufficient funds**: 4000000000009995

Any future date and any 3-digit CVV will work for testing.

## Notes

- The integration supports LKR (Sri Lankan Rupee) currency
- Payment amounts are calculated as 25% deposit of the total
- Successful payments automatically update the catering request status to "CONFIRMED"
- Failed payments update the payment status to "FAILED"
