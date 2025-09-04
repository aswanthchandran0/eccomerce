function validateProductName(name) {
  if (!name || name.trim().length === 0) return 'Product name is required';
  if (name.length > 100) return 'Product name must not exceed 100 characters';
  return null;
}

function validatePrice(price) {
  if (!price || price <= 0) return 'Valid product price is required';
  return null;
}

function validateDescription(description) {
  if (!description || description.trim().length === 0)
    return 'Description is required';
  if (description.length > 500)
    return 'Description must not exceed 500 characters';
  return null;
}

function validateCategory(category) {
  if (!category || category.trim().length === 0)
    return 'Category is required';
  return null;
}

function validateBrand(brand) {
  if (!brand || brand.trim().length === 0) return 'Brand is required';
  return null;
}

function validateVariants(variants) {
  if (!variants) return 'At least one variant is required';

  let parsed;
  try {
    parsed = typeof variants === 'string' ? JSON.parse(variants) : variants;
  } catch (err) {
    return 'Invalid variants format';
  }

  if (!Array.isArray(parsed) || parsed.length === 0)
    return 'At least one variant is required';

  for (const v of parsed) {
    if (!v.size || !['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(v.size)) {
      return 'Variant size is invalid';
    }
    if (v.stock === undefined || v.stock < 0) {
      return 'Variant stock must be 0 or greater';
    }
  }

  return null;
}

function validateImages(images) {
  if (!images || images.length === 0) return 'At least one image is required';
  return null;
}

module.exports = {
  validateProductName,
  validatePrice,
  validateDescription,
  validateCategory,
  validateBrand,
  validateVariants,
  validateImages,
};
