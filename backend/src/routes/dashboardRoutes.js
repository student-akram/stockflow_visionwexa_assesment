
const express = require("express");
const { Op } = require("sequelize");

const { Organization, Product } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All dashboard endpoints require authentication.
router.use(authMiddleware);

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    // Get this organization's low-stock threshold.
    const organization = await Organization.findByPk(
      organizationId,
      {
        attributes: ["id", "name", "lowStockThreshold"],
      }
    );

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found.",
      });
    }

    const threshold = organization.lowStockThreshold;

    // Calculate inventory statistics for this organization only.
    const [totalProducts, totalUnits, lowStockItems] =
      await Promise.all([
        Product.count({
          where: { organizationId },
        }),

        Product.sum("quantity", {
          where: { organizationId },
        }),

        Product.count({
          where: {
            organizationId,
            quantity: {
              [Op.lte]: threshold,
            },
          },
        }),
      ]);

    return res.status(200).json({
      organization: {
        id: organization.id,
        name: organization.name,
        lowStockThreshold: threshold,
      },
      statistics: {
        totalProducts,
        totalUnits: totalUnits ?? 0,
        lowStockItems,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve dashboard statistics.",
    });
  }
});

module.exports = router;
