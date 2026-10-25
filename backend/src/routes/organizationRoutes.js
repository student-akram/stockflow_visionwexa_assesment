
const express = require("express");
const { Organization } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All organization settings require authentication.
router.use(authMiddleware);

// GET /api/organization/settings
// Retrieve the authenticated user's organization settings.
router.get("/settings", async (req, res) => {
  try {
    const organization = await Organization.findByPk(
      req.user.organizationId,
      {
        attributes: ["id", "name", "lowStockThreshold", "createdAt"],
      }
    );

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found.",
      });
    }

    return res.status(200).json({
      organization,
    });
  } catch (error) {
    console.error("Get organization settings error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve organization settings.",
    });
  }
});

// PUT /api/organization/settings
// Update the authenticated user's own organization settings.
router.put("/settings", async (req, res) => {
  const allowedFields = ["name", "lowStockThreshold"];
  const suppliedFields = Object.keys(req.body);

  if (
    suppliedFields.length === 0 ||
    suppliedFields.some((field) => !allowedFields.includes(field))
  ) {
    return res.status(400).json({
      message: "Provide a valid organization name or low-stock threshold.",
    });
  }

  const updates = {};

  if (Object.hasOwn(req.body, "name")) {
    if (
      typeof req.body.name !== "string" ||
      !req.body.name.trim()
    ) {
      return res.status(400).json({
        message: "Organization name is required.",
      });
    }

    if (req.body.name.trim().length > 100) {
      return res.status(400).json({
        message: "Organization name cannot exceed 100 characters.",
      });
    }

    updates.name = req.body.name.trim();
  }

  if (Object.hasOwn(req.body, "lowStockThreshold")) {
    const threshold = req.body.lowStockThreshold;

    if (
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      return res.status(400).json({
        message: "Low-stock threshold must be a non-negative integer.",
      });
    }

    updates.lowStockThreshold = threshold;
  }

  try {
    const organization = await Organization.findByPk(
      req.user.organizationId
    );

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found.",
      });
    }

    await organization.update(updates);

    return res.status(200).json({
      message: "Organization settings updated successfully.",
      organization: {
        id: organization.id,
        name: organization.name,
        lowStockThreshold: organization.lowStockThreshold,
      },
    });
  } catch (error) {
    console.error("Update organization settings error:", error.message);

    return res.status(500).json({
      message: "Unable to update organization settings.",
    });
  }
});

module.exports = router;
