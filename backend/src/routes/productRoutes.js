const express = require("express");
const { Product } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protect every product endpoint.
router.use(authMiddleware);

// Validate numeric product IDs.
// Assumes Product.id uses a positive integer.
function isValidProductId(id) {
  return /^\d+$/.test(id) && Number(id) > 0;
}

// Validate product input.
function validateProduct(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate || body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      errors.push("Product name is required.");
    }
  }

  if (!isUpdate || body.sku !== undefined) {
    if (typeof body.sku !== "string" || !body.sku.trim()) {
      errors.push("SKU is required.");
    }
  }

  if (!isUpdate || body.quantity !== undefined) {
    if (
      !Number.isInteger(body.quantity) ||
      body.quantity < 0
    ) {
      errors.push("Quantity must be a non-negative integer.");
    }
  }

  if (!isUpdate || body.price !== undefined) {
    const price = Number(body.price);

    if (
      body.price === "" ||
      body.price === null ||
      body.price === undefined ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      errors.push("Price must be a non-negative number.");
    }
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    errors.push("Description must be a string or null.");
  }

  return errors;
}

// POST /api/products - Create a product.
router.post("/", async (req, res) => {
  const errors = validateProduct(req.body);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const product = await Product.create({
      name: req.body.name.trim(),
      sku: req.body.sku.trim(),
      description: req.body.description ?? null,
      quantity: req.body.quantity,
      price: req.body.price,

      // Never trust organizationId from the request body.
      organizationId: req.user.organizationId,
    });

    return res.status(201).json({
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "This SKU already exists in your organization.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Invalid product data.",
      });
    }

    console.error("Create product error:", error.message);

    return res.status(500).json({
      message: "Unable to create product.",
    });
  }
});

// GET /api/products - List this organization's products.
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        organizationId: req.user.organizationId,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ products });
  } catch (error) {
    console.error("List products error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve products.",
    });
  }
});

// GET /api/products/:id - Get one product.
router.get("/:id", async (req, res) => {
  if (!isValidProductId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid product ID.",
    });
  }

  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Get product error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve product.",
    });
  }
});

// PUT /api/products/:id - Update a product.
router.put("/:id", async (req, res) => {
  if (!isValidProductId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid product ID.",
    });
  }

  const allowedFields = [
    "name",
    "sku",
    "description",
    "quantity",
    "price",
  ];

  const suppliedFields = Object.keys(req.body);

  if (
    suppliedFields.length === 0 ||
    suppliedFields.some(
      (field) => !allowedFields.includes(field)
    )
  ) {
    return res.status(400).json({
      message: "Provide valid product fields to update.",
    });
  }

  const errors = validateProduct(req.body, true);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] =
          field === "name" || field === "sku"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    await product.update(updates);

    return res.status(200).json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "This SKU already exists in your organization.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Invalid product data.",
      });
    }

    console.error("Update product error:", error.message);

    return res.status(500).json({
      message: "Unable to update product.",
    });
  }
});

// DELETE /api/products/:id - Delete a product.
router.delete("/:id", async (req, res) => {
  if (!isValidProductId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid product ID.",
    });
  }

  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    await product.destroy();

    return res.status(200).json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    return res.status(500).json({
      message: "Unable to delete product.",
    });
  }
});

module.exports = router;
