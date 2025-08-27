import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      productId,
      quantity,
      shippingAddress,
      billingAddress,
      paymentMethod,
      isRental,
      rentalDetails
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.availability !== 'Available') {
      return res.status(400).json({ error: 'Product is not available' });
    }

    // Calculate total amount
    let totalAmount = product.price * quantity;
    let shippingCost = 0;

    if (product.shipping && !product.shipping.free) {
      shippingCost = product.shipping.cost;
      totalAmount += shippingCost;
    }

    // Add rental costs if applicable
    if (isRental && rentalDetails) {
      const { startDate, endDate, dailyRate } = rentalDetails;
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      totalAmount = dailyRate * days;
    }

    const order = await Order.create({
      buyer: req.user.id,
      seller: product.seller,
      product: productId,
      quantity,
      totalAmount,
      shippingCost,
      paymentMethod,
      shippingAddress,
      billingAddress,
      isRental,
      rentalDetails: isRental ? rentalDetails : undefined
    });

    // Update product availability
    product.availability = 'Reserved';
    await product.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('product');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get user orders (buyer)
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('product', 'name images price')
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get user sales (seller)
// @route   GET /api/orders/my-sales
// @access  Private
router.get('/my-sales', protect, async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate('product', 'name images price')
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get my sales error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('product');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.buyer._id.toString() !== req.user.id && 
        order.seller._id.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Update order status (seller only)
// @route   PUT /api/orders/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, trackingNumber, estimatedDelivery } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is the seller
    if (order.seller.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    // Update product availability based on status
    if (status === 'Delivered') {
      const product = await Product.findById(order.product);
      if (product) {
        product.availability = 'Sold';
        await product.save();
      }
    } else if (status === 'Cancelled') {
      const product = await Product.findById(order.product);
      if (product) {
        product.availability = 'Available';
        await product.save();
      }
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('product');

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Cancel order (buyer only)
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is the buyer
    if (order.buyer.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Only allow cancellation if order is pending or confirmed
    if (!['Pending', 'Confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'Cancelled';
    order.cancellationReason = cancellationReason;

    // Update product availability
    const product = await Product.findById(order.product);
    if (product) {
      product.availability = 'Available';
      await product.save();
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('product');

    res.json(updatedOrder);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Mark order as delivered (buyer only)
// @route   PUT /api/orders/:id/delivered
// @access  Private
router.put('/:id/delivered', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is the buyer
    if (order.buyer.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (order.status !== 'Shipped') {
      return res.status(400).json({ error: 'Order must be shipped before marking as delivered' });
    }

    order.status = 'Delivered';
    order.actualDelivery = new Date();

    // Update product availability
    const product = await Product.findById(order.product);
    if (product) {
      product.availability = 'Sold';
      await product.save();
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('product');

    res.json(updatedOrder);
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
