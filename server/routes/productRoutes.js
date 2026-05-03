const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  exportCSV
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// All product routes require authentication
router.use(protect);

router.route('/').get(getProducts).post(createProduct);
router.route('/export/csv').get(exportCSV); // Must be before /:id route
router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
