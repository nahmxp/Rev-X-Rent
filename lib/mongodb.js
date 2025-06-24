import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// In-memory database for development when no valid MongoDB URI is provided
export let mockDB = { 
  products: [],
  orders: [],
  users: [
    {
      _id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      isAdmin: true,
      createdAt: new Date('2023-01-15')
    },
    {
      _id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      username: 'janesmith',
      isAdmin: false,
      createdAt: new Date('2023-02-20')
    },
    {
      _id: 'user3',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      username: 'alexj',
      isAdmin: false,
      createdAt: new Date('2023-03-10')
    }
  ]
};

// Function to generate a random ID similar to MongoDB's ObjectId
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

class MockProductModel {
  constructor(collection) {
    this.collection = collection;
  }

  static find(query = {}) {
    // Handle search query
    if (query.$or) {
      const searchPatterns = query.$or.map(condition => {
        const field = Object.keys(condition)[0];
        const regexObj = condition[field];
        const pattern = regexObj.$regex.toLowerCase();
        return { field, pattern };
      });
      
      // Filter products that match any of the search patterns
      const results = mockDB.products.filter(product => {
        return searchPatterns.some(({ field, pattern }) => {
          const value = product[field];
          return value && value.toLowerCase().includes(pattern);
        });
      });
      
      return Promise.resolve(results);
    }
    
    // Regular product listing
    return Promise.resolve(mockDB.products || []);
  }

  static findById(id) {
    const item = mockDB.products.find(p => p._id === id);
    return Promise.resolve(item || null);
  }

  static async create(data) {
    const newItem = { 
      ...data, 
      _id: generateId(), 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    mockDB.products.push(newItem);
    return Promise.resolve(newItem);
  }

  static async findByIdAndUpdate(id, data) {
    const index = mockDB.products.findIndex(p => p._id === id);
    if (index === -1) return null;
    
    const updated = { 
      ...mockDB.products[index], 
      ...data, 
      updatedAt: new Date() 
    };
    mockDB.products[index] = updated;
    return Promise.resolve(updated);
  }

  static async findByIdAndDelete(id) {
    const index = mockDB.products.findIndex(p => p._id === id);
    if (index === -1) return null;
    
    mockDB.products.splice(index, 1);
    return Promise.resolve(true);
  }
}

class MockUserModel {
  static find() {
    return {
      select: function(fields) {
        // If fields is '-password', then return all users without the password field
        if (fields === '-password') {
          return Promise.resolve(mockDB.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }));
        }
        return Promise.resolve(mockDB.users || []);
      }
    };
  }

  static findById(id) {
    const user = mockDB.users.find(u => u._id === id);
    return Promise.resolve(user || null);
  }

  static findOne(query) {
    if (query.email) {
      const user = mockDB.users.find(u => u.email === query.email);
      return Promise.resolve(user || null);
    }
    if (query.username) {
      const user = mockDB.users.find(u => u.username === query.username);
      return Promise.resolve(user || null);
    }
    return Promise.resolve(null);
  }

  static async create(data) {
    // In a real app, password would be hashed here
    // We'll simulate it by not storing the actual password in the mock data
    const { password, ...userWithoutPassword } = data;
    
    const newUser = { 
      ...userWithoutPassword, 
      _id: generateId(), 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    
    mockDB.users.push(newUser);
    
    // Return a complete user object for the API response
    return Promise.resolve({
      ...newUser,
      // Include non-enumerable password property for the model's use
      // but it won't be included in JSON.stringify
      get password() { return password; }
    });
  }

  static async findByIdAndUpdate(id, data, options = {}) {
    const index = mockDB.users.findIndex(u => u._id === id);
    if (index === -1) return null;
    
    // Handle password specially
    const { password, ...updateData } = data;
    
    // Update user data
    const updated = { 
      ...mockDB.users[index], 
      ...updateData, 
      updatedAt: new Date() 
    };
    
    // Only update password if it was provided
    if (password) {
      // In a real app, password would be hashed here
      // For the mock, we're simulating not storing the actual password
      Object.defineProperty(updated, 'password', {
        value: password,
        enumerable: false
      });
    }
    
    mockDB.users[index] = updated;
    
    return Promise.resolve(updated);
  }

  static async findByIdAndDelete(id) {
    const index = mockDB.users.findIndex(u => u._id === id);
    if (index === -1) return null;
    
    mockDB.users.splice(index, 1);
    return Promise.resolve(true);
  }
}

class MockOrderModel {
  static find(query = {}) {
    // Initialize orders array if it doesn't exist
    if (!mockDB.orders) {
      mockDB.orders = [];
    }
    
    // Filter orders based on userId if provided
    let filteredOrders = [...mockDB.orders];
    
    if (query.userId) {
      filteredOrders = filteredOrders.filter(order => order.userId === query.userId);
    }
    
    return Promise.resolve(filteredOrders);
  }

  static findById(id) {
    // Initialize orders array if it doesn't exist
    if (!mockDB.orders) {
      mockDB.orders = [];
    }
    
    const order = mockDB.orders.find(o => o._id === id);
    return Promise.resolve(order || null);
  }

  static async create(data) {
    // Initialize orders array if it doesn't exist
    if (!mockDB.orders) {
      mockDB.orders = [];
    }
    
    const newOrder = { 
      ...data, 
      _id: generateId(), 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    
    // Ensure order has an orderNumber
    if (!newOrder.orderNumber) {
      newOrder.orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    
    mockDB.orders.push(newOrder);
    return Promise.resolve(newOrder);
  }

  static async findByIdAndUpdate(id, data, options = {}) {
    // Initialize orders array if it doesn't exist
    if (!mockDB.orders) {
      mockDB.orders = [];
    }
    
    const index = mockDB.orders.findIndex(o => o._id === id);
    if (index === -1) return null;
    
    const updated = { 
      ...mockDB.orders[index], 
      ...data, 
      updatedAt: new Date() 
    };
    
    mockDB.orders[index] = updated;
    return Promise.resolve(updated);
  }

  static async findByIdAndDelete(id) {
    // Initialize orders array if it doesn't exist
    if (!mockDB.orders) {
      mockDB.orders = [];
    }
    
    const index = mockDB.orders.findIndex(o => o._id === id);
    if (index === -1) return null;
    
    mockDB.orders.splice(index, 1);
    return Promise.resolve(true);
  }
}

class MockCartModel {
  static async findOne(query = {}) {
    // Initialize carts array if it doesn't exist
    if (!mockDB.carts) {
      mockDB.carts = [];
    }
    
    // Find cart for user
    const cart = mockDB.carts.find(c => c.userId === query.userId);
    return Promise.resolve(cart || null);
  }

  static async create(data) {
    // Initialize carts array if it doesn't exist
    if (!mockDB.carts) {
      mockDB.carts = [];
    }
    
    const newCart = { 
      ...data, 
      _id: generateId(), 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    
    mockDB.carts.push(newCart);
    return Promise.resolve(newCart);
  }

  static async findOneAndUpdate(query, data, options = {}) {
    // Initialize carts array if it doesn't exist
    if (!mockDB.carts) {
      mockDB.carts = [];
    }
    
    const index = mockDB.carts.findIndex(c => c.userId === query.userId);
    
    // If cart doesn't exist and upsert is true, create it
    if (index === -1 && options.upsert) {
      const newCart = { 
        userId: query.userId, 
        ...data.$set, 
        _id: generateId(), 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      mockDB.carts.push(newCart);
      return Promise.resolve(newCart);
    }
    
    // If cart doesn't exist and upsert is false, return null
    if (index === -1) {
      return Promise.resolve(null);
    }
    
    // Update existing cart
    if (data.$set) {
      mockDB.carts[index] = { 
        ...mockDB.carts[index], 
        ...data.$set, 
        updatedAt: new Date() 
      };
    }
    
    // Return the updated document if new: true, otherwise return the original
    return Promise.resolve(options.new ? mockDB.carts[index] : mockDB.carts[index]);
  }

  static async findOneAndDelete(query) {
    // Initialize carts array if it doesn't exist
    if (!mockDB.carts) {
      mockDB.carts = [];
    }
    
    const index = mockDB.carts.findIndex(c => c.userId === query.userId);
    if (index === -1) return Promise.resolve(null);
    
    const deletedCart = mockDB.carts[index];
    mockDB.carts.splice(index, 1);
    return Promise.resolve(deletedCart);
  }
}

class MockWishlistModel {
  static async findOne(query = {}) {
    // Initialize wishlists array if it doesn't exist
    if (!mockDB.wishlists) {
      mockDB.wishlists = [];
    }
    
    // Find wishlist for user
    const wishlist = mockDB.wishlists.find(w => w.userId === query.userId);
    return Promise.resolve(wishlist || null);
  }

  static async create(data) {
    // Initialize wishlists array if it doesn't exist
    if (!mockDB.wishlists) {
      mockDB.wishlists = [];
    }
    
    const newWishlist = { 
      ...data, 
      _id: generateId(), 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    
    mockDB.wishlists.push(newWishlist);
    return Promise.resolve(newWishlist);
  }

  static async findOneAndUpdate(query, data, options = {}) {
    // Initialize wishlists array if it doesn't exist
    if (!mockDB.wishlists) {
      mockDB.wishlists = [];
    }
    
    const index = mockDB.wishlists.findIndex(w => w.userId === query.userId);
    
    // If wishlist doesn't exist and upsert is true, create it
    if (index === -1 && options.upsert) {
      const newWishlist = { 
        userId: query.userId, 
        ...data.$set, 
        _id: generateId(), 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      mockDB.wishlists.push(newWishlist);
      return Promise.resolve(newWishlist);
    }
    
    // If wishlist doesn't exist and upsert is false, return null
    if (index === -1) {
      return Promise.resolve(null);
    }
    
    // Update existing wishlist
    if (data.$set) {
      mockDB.wishlists[index] = { 
        ...mockDB.wishlists[index], 
        ...data.$set, 
        updatedAt: new Date() 
      };
    }
    
    // Return the updated document if new: true, otherwise return the original
    return Promise.resolve(options.new ? mockDB.wishlists[index] : mockDB.wishlists[index]);
  }

  static async findOneAndDelete(query) {
    // Initialize wishlists array if it doesn't exist
    if (!mockDB.wishlists) {
      mockDB.wishlists = [];
    }
    
    const index = mockDB.wishlists.findIndex(w => w.userId === query.userId);
    if (index === -1) return Promise.resolve(null);
    
    const deletedWishlist = mockDB.wishlists[index];
    mockDB.wishlists.splice(index, 1);
    return Promise.resolve(deletedWishlist);
  }
}

const connectMongo = async () => {
  if (cached.conn) {
      console.log('MongoDB already connected, using existing connection');
    return cached.conn;
    }
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('your-username')) {
      console.warn('No valid MONGODB_URI found in environment variables');
      console.warn('Using in-memory database instead of MongoDB. This is for development only.');
      
      // Mock the mongoose models
      mongoose.models.Product = MockProductModel;
      mongoose.models.User = MockUserModel;
      mongoose.models.Order = MockOrderModel;
      mongoose.models.Cart = MockCartModel;
      mongoose.models.Wishlist = MockWishlistModel;
      
      // Automatically seed sample orders data
      seedMockOrders();
      
      return; // Don't try to connect to MongoDB
    }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'products-db',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

export const seedMockOrders = (force = false) => {
  // Only seed if there are no orders yet, or if force is true
  if (force || mockDB.orders.length === 0) {
    const sampleOrders = [
      {
        _id: generateId(),
        orderNumber: 'ORD-1689340000000-123',
        userId: 'user1',
        items: [
          {
            productId: 'product1',
            name: 'Refurbished iPhone 12',
            price: 599.99,
            quantity: 1,
            image: '/images/products/iphone12.jpg',
            isRental: false
          }
        ],
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105'
          }
        },
        status: 'delivered',
        subtotal: 599.99,
        tax: 54.00,
        shippingFee: 15.00,
        total: 668.99,
        orderedAt: new Date('2023-07-14T10:00:00Z'),
        hasRentalItems: false,
        hasMixedItems: false,
        createdAt: new Date('2023-07-14T10:00:00Z'),
        updatedAt: new Date('2023-07-14T10:00:00Z')
      },
      {
        _id: generateId(),
        orderNumber: 'ORD-1689426400000-456',
        userId: 'user2',
        items: [
          {
            productId: 'product2',
            name: 'Refurbished MacBook Pro',
            price: 1299.99,
            quantity: 1,
            image: '/images/products/macbook.jpg',
            isRental: false
          },
          {
            productId: 'product3',
            name: 'Wireless Headphones',
            price: 149.99,
            quantity: 2,
            image: '/images/products/headphones.jpg',
            isRental: false
          }
        ],
        customer: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '987-654-3210',
          address: {
            street: '456 Oak St',
            city: 'Seattle',
            state: 'WA',
            postalCode: '98101'
          }
        },
        status: 'sent',
        subtotal: 1599.97,
        tax: 144.00,
        shippingFee: 0.00,
        total: 1743.97,
        orderedAt: new Date('2023-07-15T14:30:00Z'),
        hasRentalItems: false,
        hasMixedItems: false,
        createdAt: new Date('2023-07-15T14:30:00Z'),
        updatedAt: new Date('2023-07-15T14:30:00Z')
      },
      {
        _id: generateId(),
        orderNumber: 'ORD-1689599200000-321',
        userId: 'user3',
        items: [
          {
            productId: 'product5',
            name: 'External Hard Drive',
            price: 89.99,
            quantity: 1,
            image: '/images/products/hard-drive.jpg',
            isRental: false
          },
          {
            productId: 'product6',
            name: 'Professional Camera',
            price: 799.99,
            quantity: 1,
            image: '/images/products/camera.jpg',
            isRental: true,
            rentalDetails: {
              duration: 3,
              unit: 'daily',
              rate: 99.99,
              returnDate: new Date('2023-07-20T15:00:00Z')
            }
          }
        ],
        customer: {
          name: 'Alex Johnson',
          email: 'alex@example.com',
          phone: '555-123-4567',
          address: {
            street: '789 Pine St',
            city: 'Portland',
            state: 'OR',
            postalCode: '97205'
          }
        },
        status: 'processing',
        subtotal: 389.96,
        tax: 35.10,
        shippingFee: 15.00,
        total: 440.06,
        orderedAt: new Date('2023-07-17T15:00:00Z'),
        hasRentalItems: true,
        hasMixedItems: true,
        createdAt: new Date('2023-07-17T15:00:00Z'),
        updatedAt: new Date('2023-07-17T15:00:00Z')
      }
    ];
    
    mockDB.orders = sampleOrders;
    console.log('Seeded mock orders database with sample data');
  }
};

export default connectMongo;
