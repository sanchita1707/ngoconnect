const Category = require('../models/Category');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: 'Active' });
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (Admin only)
// @route   POST /api/categories
// @access  Private (Admin only)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    
    const category = await Category.create({
      name,
      description,
      icon,
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory
};
