const Brand = require("../models/BrandModel");
const mockBrands = require("../mock/brand");
const brandService = require("../services/brandService");
const brandValidator = require("../validators/brandValidation");
const branding = {
  addBrand: async (req, res, next) => {
    try {
      const { error, value } = brandValidator.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const formattedErrors = error.details.reduce((acc, err) => {
          const field = err.path.join(".");
          acc[field] = err.message;
          return acc;
        }, {});

        return res.status(400).json({
          success: false,
          errors: formattedErrors,
        });
      }

      const existingBrand = await Brand.findOne({
        name: { $regex: new RegExp(`^${value.name}$`, "i") },
      });

      if (existingBrand) {
        return res.status(409).json({
          success: false,
          errors: { name: "Brand already exists" },
        });
      }

      const brand = new Brand({
        name: value.name,
        description: value.description || "",
      });

      await brand.save();
      req.flash("success", `Brand ${brand.name} created  successfully`);
      res.json({ success: true });
    } catch (err) {
      err.function = "addBrand";
      next(err);
    }
  },

  brandingPage: async (req, res) => {
    try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    
       const { data: brands, pagination } = await brandService.getBrands({ page, limit });
      console.log("flash success message", res.locals.success);

      res.render("brand/list", {
        brands,
        pagination,
        successMessage: res.locals.success,
        errorMessage: res.locals.error,
      });
    } catch (err) {
      err.function = "brandingPage";
      next(err);
    }
  },
  editBrand: async (req, res, next) => {
    try {
      const brandId = req.params.id;
      const brand = await Brand.findById(req.params.id);
      console.log("brand  ", brand);
      if (!brand) {
        req.flash("error", "brand not found");
        return res.status(404).json({
          success: false,
          errors: "brand not found",
        });
      }

      const { error, value } = brandValidator.validate(req.body, {
        abortEarly: false, // show all validation errors
        stripUnknown: true, // remove unwanted fields
      });

      if (error) {
        const formattedErrors = error.details.reduce((acc, err) => {
          const field = err.path.join(".");
          acc[field] = err.message;
          return acc;
        }, {});

        return res.status(400).json({
          success: false,
          errors: formattedErrors,
        });
      }

      const existingBrand = await Brand.findOne({
        _id: { $ne: brandId }, // exclude current brand
        name: { $regex: new RegExp(`^${value.name}$`, "i") }, // case-insensitive match
      });

      if (existingBrand) {
        return res.status(409).json({
          success: false,
          errors: { name: "Brand name must be unique" },
        });
      }

      brand.name = value.name || brand.name;
      brand.description = value.description || brand.description;

      await brand.save();
      req.flash("success", `Brand ${brand.name} updated  successfully`);
      res.status(200).json({ success: true });
    } catch (err) {
      err.function = "editBrand";
      next(err);
    }
  },
  toggleBrandStatus: async (req, res, next) => {
    try {
      const brandId = req.params.id;
      const brand = await Brand.findById(brandId);

      if (!brand) {
        req.flash("error", "Brand not found");
        return res.status(404).json({
          success: false,
          errors: "Brand not found",
        });
      }

      brand.is_active = !brand.is_active;
      await brand.save();

      req.flash(
        "success",
        `Brand ${brand.name} ${
          brand.is_active ? "unblocked" : "blocked"
        } successfully`
      );

      res.status(200).json({ success: true});
    } catch (err) {
      err.function = "toggleBrandStatus";
      next(err);
    }
  },
};

module.exports = { branding };
