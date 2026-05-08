// Example backend controller structure for your Node.js/Express backend
// This shows what API endpoints your frontend expects

const asyncHandler = require('express-async-handler');
const Food = require('../models/Food'); // Your Food model
const Category = require('../models/Category'); // Your Category model

// @desc    Get all food items
// @route   GET /api/food
// @access  Public
exports.getFoodItems = asyncHandler(async (req, res) => {
  const foodItems = await Food.find({}).populate('category');
  res.json({
    success: true,
    data: foodItems
  });
});

// @desc    Get food items by category
// @route   GET /api/food/category/:categoryId
// @access  Public
exports.getFoodItemsByCategory = asyncHandler(async (req, res) => {
  const foodItems = await Food.find({ category: req.params.categoryId });
  res.json({
    success: true,
    data: foodItems
  });
});

// @desc    Get single food item
// @route   GET /api/food/:id
// @access  Public
exports.getFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await Food.findById(req.params.id);
  
  if (!foodItem) {
    return res.status(404).json({
      success: false,
      message: 'Food item not found'
    });
  }

  res.json({
    success: true,
    data: foodItem
  });
});

// @desc    Search food items
// @route   GET /api/food/search
// @access  Public
exports.searchFoodItems = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  const foodItems = await Food.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  });

  res.json({
    success: true,
    data: foodItems
  });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json({
    success: true,
    data: categories
  });
});

// Example Food Model (models/Food.js)
/*
const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  ingredients: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Food', foodSchema);
*/

// Example Category Model (models/Category.js)
/*
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
*/
