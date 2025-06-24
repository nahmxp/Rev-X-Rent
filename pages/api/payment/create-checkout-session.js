import Stripe from 'stripe';
import Order from '../../../models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async (req, res) => {
  if (req.method === 'POST') {
    const { orderId } = req.body;

    try {
      // Find the order in the database
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Create line items for the Stripe Checkout session
      const line_items = order.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe requires price in cents
        },
        quantity: item.quantity,
      }));

      // Add shipping fee as a line item if applicable
      if (order.shippingFee > 0) {
        line_items.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shipping Fee',
            },
            unit_amount: order.shippingFee * 100,
          },
          quantity: 1,
        });
      }

       // Add tax as a line item if applicable
       if (order.tax > 0) {
        line_items.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Tax',
            },
            unit_amount: order.tax * 100,
          },
          quantity: 1,
        });
      }

      // Create the Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: line_items,
        mode: 'payment',
        success_url: `${req.headers.origin}/orders?success=true&orderId=${orderId}`,
        cancel_url: `${req.headers.origin}/orders?canceled=true&orderId=${orderId}`,
        metadata: { orderId: orderId.toString() },
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Error creating checkout session' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}; 