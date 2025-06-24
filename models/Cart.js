import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
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
  brand: String,
  category: String,
  image: String,
  description: String,
  isRentable: {
    type: Boolean,
    default: false
  },
  rentalPrice: {
    hourly: Number,
    daily: Number
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  items: [CartItemSchema]
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema); 