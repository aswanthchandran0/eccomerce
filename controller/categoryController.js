const Category = require('../models/categoryModel')
const categoryValidator =require("../validators/categoryValidation");
const categoryService = require("../services/categoryService");

const category = {
      addCategory: async (req, res, next) => {
    try {
      const { error, value } = categoryValidator.validate(req.body, {
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

      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${value.name}$`, "i") },
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          errors: { name: "Category already exists" },
        });
      }

      const category = new Category({
        name: value.name,
        description: value.description || "",
      });

      await category.save();
      req.flash("success", `category ${category.name} created  successfully`);
      res.json({ success: true });
    } catch (err) {
      err.function = "addCategory";
      next(err);
    }
  },


  
    categoryPage: async (req, res,next) => {
      try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
       console.log("request reachin in this page")
         const { data: categories, pagination } = await categoryService.getCategory({ page, limit });
         console.log('data in category servie',categories)
        console.log("flash success message", res.locals.success);
        res.render("category/list", {
          categories,
          pagination,
          successMessage: res.locals.success,
          errorMessage: res.locals.error,
        });
      } catch (err) {
        err.function = "categoryPage";
        next(err);
      }
    },


    editCategory: async (req, res, next) => {
    try {
      const categoryId = req.params.id;
      const category = await Category.findById(req.params.id);
        console.log("categor",category)
      if (!category) {
        req.flash("error", "category not found");
        return res.status(404).json({
          success: false,
          errors: "category not found",
        });
      }

      const { error, value } = categoryValidator.validate(req.body, {
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

      const existingCategory = await Category.findOne({
        _id: { $ne: categoryId }, // exclude current category
        name: { $regex: new RegExp(`^${value.name}$`, "i") }, // case-insensitive match
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          errors: { name: "Category name must be unique" },
        });
      }

     category.name = value.name || category.name;
category.description = value.description || category.description;


      await category.save();
      req.flash("success", `category ${category.name} updated  successfully`);
      res.status(200).json({ success: true });
    } catch (err) {
      err.function = "editCategory";
      next(err);
    }
  },


  toggleCategoryStatus: async (req, res, next) => {
    try {
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId);

      if (!category) {
        req.flash("error", "catagory not found");
        return res.status(404).json({
          success: false,
          errors: "category not found",
        });
      }

      category.is_active = !category.is_active;
      await category.save();

      req.flash(
        "success",
        `catagory ${category.name} ${
          category.is_active ? "unblocked" : "blocked"
        } successfully`
      );

      res.status(200).json({ success: true});
    } catch (err) {
      err.function = "toggleCategoryStatus";
      next(err);
    }
  },


//     deleteCatagory: async (req,res)=>{
//         const catagoryId = req.params.id
//         console.log(catagoryId);
//         try{
//             await model.findByIdAndRemove(catagoryId)
//             res.redirect('/admin/catagory')

//         }catch(errors){
//           console.log(errors);
//           res.status(500).send('internal server error')
//         }
//     },
//     addCategory: async(req,res)=>{
// try{
//          const category = req.body.categoryName
//          if(category.trim().length===0){
//             const   errors = {error: 'category name is required'}
//             return res.render('addCatagory', {errors})
//          }
//          const existedCatagory = await model.findOne({name:{ $regex: new RegExp('^' + category.trim() + '$', 'i') }})
//          console.log('existed category',existedCatagory);
//          if(existedCatagory){
//             const   errors = {error: 'catagory already exists'}
//             return res.render('addCatagory', {errors})
//          }else{
//             const newCatagory = new model({
//                 name:category
//             })
//             await newCatagory.save()
//             res.redirect('/admin/catagory')
//          }

// }catch(error){
//     console.log(error);
//     res.status(500)
// }
//     }
}

module.exports = {category}