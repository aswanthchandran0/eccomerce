const productModel = require('../models/productModel')

// Utility: reduce stock across variants sequentially
const reduceStockFromVariants = async (productDoc, quantity) => {
  let qtyToReduce = quantity;

  // Clone variants
  const updatedVariants = productDoc.variants.map(v => ({ ...v.toObject() }));

  for (let variant of updatedVariants) {
    if (qtyToReduce <= 0) break;

    if (variant.stock > 0) {
      const reduceBy = Math.min(variant.stock, qtyToReduce);
      variant.stock -= reduceBy;
      qtyToReduce -= reduceBy;
    }
  }

  if (qtyToReduce > 0) {
    throw new Error(`Not enough stock for product ${productDoc.name}`);
  }

  // Save back updated variants
  await productModel.findByIdAndUpdate(productDoc._id, { variants: updatedVariants }, { new: true });
};

module.exports = reduceStockFromVariants
