import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { paymentIntentId, amount } = req.body;

    // Créer le remboursement
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount }),
    });

    return res.status(200).json(refund);
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return res.status(500).json({ 
      message: error.message || 'Error processing refund' 
    });
  }
}
