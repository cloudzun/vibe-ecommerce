const { body, validationResult } = require("express-validator");
const validateOrder = [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Name is required (max 100 chars)"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("address").trim().isLength({ min: 1, max: 200 }).withMessage("Address is required (max 200 chars)"),
  body("items").isArray({ min: 1 }).withMessage("At least one item required"),
  body("total").isFloat({ gt: 0 }).withMessage("Total must be a positive number"),
];
const validateRegister = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email format"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
}
module.exports = { validateOrder, validateRegister, handleValidationErrors };
