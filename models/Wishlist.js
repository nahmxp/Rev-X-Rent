import mongoose from 'mongoose';

const WishlistItemSchema = new mongoose.Schema({
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

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  items: [WishlistItemSchema]
}, { timestamps: true });

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema); 