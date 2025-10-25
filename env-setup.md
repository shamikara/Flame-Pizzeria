# Sample .env.local file
# Copy this to your .env.local and fill in the actual values

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/flame_pizzeria"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key-here"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"

# JWT
JWT_SECRET="your-jwt-secret-here"
