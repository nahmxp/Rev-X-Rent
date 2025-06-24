import connectMongo from '../../../lib/mongodb';
import Order from '../../../models/Order';
import { requireAuth } from '../../../lib/auth';
import checkAdminAuth from '../../../lib/checkAdminAuth';
import { sendEmail } from '../../../lib/email';

async function handler(req, res) {
  try {
    await connectMongo();
    
    const { id } = req.query;
    const { method } = req;
    
    // PUT - Update order
    if (method === 'PUT') {
      // Verify admin privileges
      const authCheck = await checkAdminAuth(req);
      if (!authCheck.success) {
        return res.status(authCheck.status).json({ error: authCheck.message });
      }
      
      try {
        // Get the current order first
        const currentOrder = await Order.findById(id);
        if (!currentOrder) {
          return res.status(404).json({ error: 'Order not found' });
        }

        // Extract update fields and track changes
        const { status, shippingFee, tax, offer, paymentEnabled } = req.body;
        const updateData = {};
        const changes = {};
        
        // Track all changes that need email notification
        if (status && status !== currentOrder.status) {
          updateData.status = status;
          changes.status = status;
        }
        
        if (paymentEnabled !== undefined && paymentEnabled !== currentOrder.paymentEnabled) {
          updateData.paymentEnabled = paymentEnabled;
          changes.paymentEnabled = paymentEnabled;
        }
        
        // Store original values if not already stored
        if (currentOrder.originalValues === undefined) {
          updateData.originalValues = {
            subtotal: currentOrder.subtotal,
            tax: currentOrder.tax,
            shippingFee: currentOrder.shippingFee,
            total: currentOrder.total,
            taxRate: currentOrder.tax / currentOrder.subtotal
          };
        }
        
        // Track shipping fee changes
        if (shippingFee !== undefined) {
          const newShippingFee = parseFloat(shippingFee);
          if (isNaN(newShippingFee) || newShippingFee < 0) {
            return res.status(400).json({ error: 'Invalid shipping fee amount' });
          }
          if (newShippingFee !== currentOrder.shippingFee) {
            updateData.shippingFee = newShippingFee;
            changes.shippingFee = newShippingFee;
          }
        }
        
        // Track tax changes
        if (tax !== undefined) {
          const newTax = parseFloat(tax);
          if (isNaN(newTax) || newTax < 0) {
            return res.status(400).json({ error: 'Invalid tax amount' });
          }
          if (newTax !== currentOrder.tax) {
            updateData.tax = newTax;
            changes.tax = newTax;
            updateData['originalValues.taxRate'] = newTax / currentOrder.subtotal;
          }
        }

        // Track offer changes
        if (offer && (!currentOrder.offer || 
            offer.type !== currentOrder.offer.type || 
            offer.value !== currentOrder.offer.value || 
            offer.description !== currentOrder.offer.description)) {
          updateData.offer = offer;
          changes.offer = offer;
        }

        // Calculate new total if needed
        if (updateData.tax !== undefined || updateData.shippingFee !== undefined || updateData.offer) {
          const baseTotal = currentOrder.subtotal +
            (updateData.tax !== undefined ? updateData.tax : currentOrder.tax) +
            (updateData.shippingFee !== undefined ? updateData.shippingFee : currentOrder.shippingFee);

          if (offer && offer.type !== 'none') {
            const value = parseFloat(offer.value);
            let discountAmount = 0;
            
            if (offer.type === 'fixed') {
              discountAmount = Math.min(value, baseTotal);
            } else if (offer.type === 'percentage') {
              discountAmount = baseTotal * (value / 100);
            }
            
            updateData.total = Math.max(0, baseTotal - discountAmount);
          } else {
            updateData.total = baseTotal;
          }
          
          changes.total = updateData.total;
        }

        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
          // Update the order
          const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
          );

          // Send email notification if there are changes to notify about
          if (Object.keys(changes).length > 0) {
            try {
              await sendEmail({
                to: updatedOrder.customer.email,
                template: 'orderUpdate',
                data: [updatedOrder.toObject(), changes]
              });
              console.log('Order update email sent successfully');
            } catch (emailError) {
              console.error('Failed to send order update email:', emailError);
              // Don't fail the update if email fails
            }
          }

          return res.status(200).json(updatedOrder);
        } else {
          // No changes to make
          return res.status(200).json(currentOrder);
        }
      } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Order API error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}

// Wrap with auth middleware
export default requireAuth(handler);