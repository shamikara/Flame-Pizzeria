# Event Catering System

A complete event catering booking system with Stripe payment integration.

## Features

- ✅ Multi-step catering form with validation
- ✅ Real-time bill calculation
- ✅ Stripe payment integration
- ✅ Payment status tracking
- ✅ Success/failure handling
- ✅ Email notifications
- ✅ Admin dashboard integration

## Setup

### 1. Environment Variables
See `env-setup.md` for required environment variables.

### 2. Stripe Configuration
See `STRIPE_SETUP.md` for complete Stripe integration setup.

### 3. Database
The system uses the following database tables:
- `cateringrequest` - Stores catering booking details
- `payment` - Tracks payment transactions

## Usage

### For Customers:
1. Navigate to `/event-catering`
2. Fill out the catering form (2 steps)
3. Review the calculated quote
4. Click "Proceed to payment"
5. Complete payment with Stripe
6. Receive confirmation

### For Admins:
- View all catering requests in the dashboard
- Track payment status
- Manage confirmed bookings

## API Endpoints

### POST `/api/catering`
Creates a new catering request with calculated totals.

**Request Body:**
```json
{
  "eventType": "wedding",
  "eventDate": "2025-01-15T00:00:00.000Z",
  "guestCount": 100,
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "menuItems": {...},
  "specialRequests": "Special dietary requirements"
}
```

**Response:**
```json
{
  "success": true,
  "id": 123,
  "status": "PENDING",
  "totals": {
    "subtotal": 250000,
    "serviceCharge": 25000,
    "tax": 20000,
    "total": 295000
  },
  "depositDue": 73750
}
```

### POST `/api/catering/checkout`
Creates Stripe payment intent for catering deposit.

**Request Body:**
```json
{
  "requestId": "123"
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 73750,
  "currency": "LKR"
}
```

### GET `/api/catering/[id]`
Fetches individual catering request details.

### POST `/api/webhooks/stripe`
Handles Stripe webhook events for payment confirmations.

## Payment Flow

1. **Form Submission** → API calculates totals and stores request
2. **Payment Initiation** → API creates Stripe Payment Intent
3. **Payment Processing** → Customer completes payment via Stripe Elements
4. **Webhook Confirmation** → Stripe sends webhook to update payment status
5. **Status Update** → Database updated with payment confirmation

## Testing

Use Stripe test cards for testing:
- **4242424242424242** - Successful payment
- **4000000000000002** - Declined payment
- **4000000000009995** - Insufficient funds

## Development

### Adding New Features
- Update the catering form in `components/catering-form.tsx`
- Modify API logic in `app/api/catering/`
- Update payment handling in checkout pages

### Customization
- Modify currency in `lib/stripe.ts`
- Update tax/service charge rates in form component
- Customize email templates in email configuration
