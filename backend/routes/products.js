import express from 'express';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { 
  cacheProduct, 
  getCachedProduct, 
  cacheSearchResults, 
  getCachedSearchResults,
  cacheCategoryProducts,
  getCachedCategoryProducts,
  invalidateCache 
} from '../utils/redis.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Create cache key based on query parameters
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    
    // Try to get cached data first
    const cachedData = await getCachedSearchResults(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Condition filter
    if (req.query.condition) {
      query.condition = req.query.condition;
    }
    
    // Location filter
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    
    // College filter
    if (req.query.college) {
      query.college = { $regex: req.query.college, $options: 'i' };
    }
    
    // Search query
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const products = await Product.find(query)
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const response = {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    // Cache the response for 15 minutes
    await cacheSearchResults(cacheKey, response, 900);

    res.json(response);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Try to get cached product first
    const cachedProduct = await getCachedProduct(req.params.id);
    if (cachedProduct) {
      // Increment view count in cache
      cachedProduct.views += 1;
      await cacheProduct(req.params.id, cachedProduct, 3600);
      return res.json(cachedProduct);
    }

    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email phone location')
      .populate('ratings.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    // Cache the product for 1 hour
    await cacheProduct(req.params.id, product, 3600);

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      condition,
      location,
      college,
      tags,
      features,
      specifications,
      shipping
    } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // Validate that at least one image is uploaded
    if (images.length === 0) {
      return res.status(400).json({ 
        error: 'At least one image is required' 
      });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      subcategory,
      brand,
      condition,
      images,
      seller: req.user.id,
      location,
      college,
      tags: tags ? JSON.parse(tags) : [],
      features: features ? JSON.parse(features) : [],
      specifications: specifications ? JSON.parse(specifications) : {},
      shipping: shipping ? JSON.parse(shipping) : {}
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'name email phone');

    // Invalidate related caches
    await invalidateCache('products:*');
    await invalidateCache(`category:${category}`);

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const updateData = { ...req.body };
    
    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = [...product.images, ...newImages];
    }
    
    // Ensure at least one image exists (either existing or new)
    if (!updateData.images || updateData.images.length === 0) {
      return res.status(400).json({ 
        error: 'At least one image is required' 
      });
    }

    // Parse JSON fields
    if (updateData.tags) updateData.tags = JSON.parse(updateData.tags);
    if (updateData.features) updateData.features = JSON.parse(updateData.features);
    if (updateData.specifications) updateData.specifications = JSON.parse(updateData.specifications);
    if (updateData.shipping) updateData.shipping = JSON.parse(updateData.shipping);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('seller', 'name email phone');

    // Invalidate related caches
    await invalidateCache('products:*');
    await invalidateCache(`product:${req.params.id}`);
    await invalidateCache(`category:${updatedProduct.category}`);

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);
    
    // Invalidate related caches
    await invalidateCache('products:*');
    await invalidateCache(`product:${req.params.id}`);
    await invalidateCache(`category:${product.category}`);

    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Add product rating
// @route   POST /api/products/:id/ratings
// @access  Private
router.post('/:id/ratings', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user already rated
    const existingRating = product.ratings.find(
      r => r.user.toString() === req.user.id
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
      existingRating.date = new Date();
    } else {
      product.ratings.push({
        user: req.user.id,
        rating,
        review
      });
    }

    await product.save();
    
    // Invalidate related caches
    await invalidateCache(`product:${req.params.id}`);
    await invalidateCache('products:*');

    res.json(product);
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories/all
// @access  Public
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
