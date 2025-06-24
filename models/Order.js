import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  image: String,
  isRental: {
    type: Boolean,
    default: false
  },
  rentalDetails: {
    duration: Number,
    unit: {
      type: String,
      enum: ['hourly', 'daily']
    },
    rate: Number,
    returnDate: Date
  }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  items: [OrderItemSchema],
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String
    }
  },
  status: {
    type: String,
    enum: ['processing', 'paid', 'confirmed', 'sent', 'delivered', 'cancelled'],
    default: 'processing'
  },
  paymentEnabled: {
    type: Boolean,
    default: false
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  originalValues: {
    subtotal: Number,
    tax: Number,
    shippingFee: Number,
    total: Number,
    taxRate: Number
  },
  offer: {
    type: {
      type: String,
      enum: ['none', 'fixed', 'percentage'],
      default: 'none'
    },
    value: {
      type: Number,
      default: 0
    },
    description: String
  },
  hasRentalItems: {
    type: Boolean,
    default: false
  },
  hasMixedItems: {
    type: Boolean,
    default: false
  },
  rentalDetails: {
    duration: Number,
    dailyRate: Number,
    returnDate: Date
  },
  orderedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);