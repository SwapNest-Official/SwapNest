import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { 
  cacheUser, 
  getCachedUser, 
  invalidateCache 
} from '../utils/redis.js';

const router = express.Router();

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Try to get cached user first
    const cachedUser = await getCachedUser(req.params.id);
    if (cachedUser) {
      return res.json(cachedUser);
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Users can only view their own profile or admins can view any
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Cache the user for 30 minutes
    await cacheUser(req.params.id, user, 1800);

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Add product to favorites
// @route   POST /api/users/favorites/:productId
// @access  Private
router.post('/favorites/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const user = await User.findById(req.user.id);
    
    // Check if product is already in favorites
    if (user.favorites.includes(req.params.productId)) {
      return res.status(400).json({ error: 'Product already in favorites' });
    }

    user.favorites.push(req.params.productId);
    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('favorites')
      .select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Remove product from favorites
// @route   DELETE /api/users/favorites/:productId
// @access  Private
router.delete('/favorites/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Check if product is in favorites
    if (!user.favorites.includes(req.params.productId)) {
      return res.status(400).json({ error: 'Product not in favorites' });
    }

    user.favorites = user.favorites.filter(
      id => id.toString() !== req.params.productId
    );
    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('favorites')
      .select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'favorites',
        populate: {
          path: 'seller',
          select: 'name email phone'
        }
      })
      .select('-password');

    res.json(user.favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get user's products count
    const productsCount = await Product.countDocuments({ seller: req.user.id });
    
    // Get user's orders count (as buyer)
    const ordersCount = await require('../models/Order.js').default.countDocuments({ buyer: req.user.id });
    
    // Get user's sales count (as seller)
    const salesCount = await require('../models/Order.js').default.countDocuments({ seller: req.user.id });
    
    // Get total earnings (as seller)
    const earnings = await require('../models/Order.js').default.aggregate([
      { $match: { seller: user._id, status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const stats = {
      productsCount,
      ordersCount,
      salesCount,
      totalEarnings: earnings.length > 0 ? earnings[0].total : 0,
      favoritesCount: user.favorites.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
