import { buffer } from 'micro';
import Stripe from 'stripe';
import Order from '../../../models/Order';
import dbConnect from '../../../lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe requires the raw body to construct the event
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  if (req.method === 'POST') {
    await dbConnect();

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      const rawBody = await buffer(req);
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log(`Checkout session completed for session ID: ${session.id}`);

      // Retrieve the order ID from the session metadata
      const orderId = session.metadata.orderId;

      if (orderId) {
        try {
          // Find the order and update its status to 'paid'
          const order = await Order.findByIdAndUpdate(
            orderId,
            { status: 'paid' },
            { new: true } // Return the updated document
          );

          if (order) {
            console.log(`Order ${orderId} status updated to paid.`);
          } else {
            console.error(`Order ${orderId} not found for webhook update.`);
          }
        } catch (err) {
          console.error(`Error updating order ${orderId} status:`, err);
          return res.status(500).json({ received: true, message: 'Failed to update order status' });
        }
      } else {
         console.error('No orderId found in session metadata for webhook.');
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}; 