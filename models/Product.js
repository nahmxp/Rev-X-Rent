import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  brand: String,
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String,
  isRentable: {
    type: Boolean,
    default: false
  },
  rentalPrice: {
    hourly: {
      type: Number,
      default: 0
    },
    daily: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
