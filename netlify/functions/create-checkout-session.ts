import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

// Initialize Stripe with secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { priceId } = JSON.parse(event.body || '{}');

    // Your price ID from Stripe Dashboard
    const PRICE_ID = priceId || process.env.VITE_STRIPE_PRICE_ID || 'price_1SKrDtAN91Um40UbiS3HguVw';

    // Create Checkout Session with 3-day trial
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 3, // 3-day free trial
      },
      success_url: `${event.headers.origin || 'http://localhost:3000'}/auth/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin || 'http://localhost:3000'}/membership`,
      allow_promotion_codes: true, // Allow discount codes
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }),
    };
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Failed to create checkout session' 
      }),
    };
  }
};
