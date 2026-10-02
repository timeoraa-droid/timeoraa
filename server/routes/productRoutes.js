const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/authMiddleware');
const { logError } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const validateObjectId = (id) => {
  if (!id) return null;
  try { return new mongoose.Types.ObjectId(id); } catch { return null; }
};

const resolveCategory = async (value) => {
  if (mongoose.Types.ObjectId.isValid(value)) {
    const byId = await Category.findById(value);
    if (byId) return byId;
  }

  const name = String(value || '').trim().slice(0, 80);
  if (!name) return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let category = await Category.findOne({ name: new RegExp(`^${escapedName}$`, 'i') });
  if (!category) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      category = await Category.create({ name, slug, isActive: true });
    } catch (error) {
      if (error.code !== 11000) throw error;
      category = await Category.findOne({ slug });
    }
  }
  return category;
};

router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { isActive: true };

    if (category && category !== 'All') {
      query.categoryName = { $regex: `^${String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
    }

    const searchTerm = typeof search === 'string' ? search.trim().slice(0, 100) : '';
    if (searchTerm) {
      const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { sku: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { movement: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    let sortOpt = { createdAt: -1 };
    if (sort === 'price-low') sortOpt = { price: 1 };
    if (sort === 'price-high') sortOpt = { price: -1 };
    if (sort === 'popularity') sortOpt = { reviewsCount: -1 };

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Product catalog is temporarily unavailable. Please try again later.' });
    }
    const products = await Product.find(query).sort(sortOpt).lean();

    const results = products.map(p => ({
      ...p,
      id: p._id.toString(),
      _id: p._id.toString(),
      effectivePrice: (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price,
      discountPercent: (p.discountPrice && p.discountPrice < p.price)
        ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0,
    }));

    res.json({ success: true, count: results.length, products: results });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Product catalog is temporarily unavailable. Please try again later.' });
    }
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    res.json({ success: true, categories });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let product;
    const id = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Product catalog is temporarily unavailable. Please try again later.' });
    }
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).lean();
    } else {
      product = await Product.findOne({ sku: id }).lean();
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.id = product._id.toString();
    product.effectivePrice = (product.discountPrice && product.discountPrice < product.price)
      ? product.discountPrice : product.price;
    product.discountPercent = (product.discountPrice && product.discountPrice < product.price)
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    res.json({ success: true, product });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, price, category, gender, description, stock, sku, discountPrice, images, video, tagline, specifications } = req.body;

    if (!name || !price || !category || !gender || !description || !sku) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }

    const categoryRecord = await resolveCategory(category);
    if (!categoryRecord) return res.status(400).json({ success: false, message: 'Please provide a valid category.' });

    const productData = {
      name, price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      category: categoryRecord._id, categoryName: categoryRecord.name,
      gender, description,
      stock: Number(stock) >= 0 ? Number(stock) : 10,
      lowStockThreshold: 5,
      sku, images: Array.isArray(images) && images.length > 0 ? images : [req.body.image || ''],
      video: video || '', tagline: tagline || '',
      specifications: specifications || {},
      rating: 5.0, reviewsCount: 0,
    };

    let product;
    if (mongoose.connection.readyState === 1) {
      product = await Product.create(productData);
    }

    res.status(201).json({
      success: true,
      product: { ...product.toObject(), id: product._id.toString(), discountPercent: 0 },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.category !== undefined) {
      const categoryRecord = await resolveCategory(updates.category);
      if (!categoryRecord) return res.status(400).json({ success: false, message: 'Please provide a valid category.' });
      updates.category = categoryRecord._id;
      updates.categoryName = categoryRecord.name;
    }

    if (updates.price) updates.price = Number(updates.price);
    if (updates.discountPrice !== undefined) updates.discountPrice = updates.discountPrice ? Number(updates.discountPrice) : null;
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);

    let product;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.id = product._id.toString();
    product.effectivePrice = (product.discountPrice && product.discountPrice < product.price) ? product.discountPrice : product.price;
    product.discountPercent = (product.discountPrice && product.discountPrice < product.price)
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    res.json({ success: true, product });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
      if (product) return res.json({ success: true, message: 'Product deactivated' });
    }
    res.status(404).json({ success: false, message: 'Product not found' });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/:id/stock', protect, admin, async (req, res) => {
  try {
    const { quantity, note } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.stock = Math.max(0, product.stock + Number(quantity));
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
