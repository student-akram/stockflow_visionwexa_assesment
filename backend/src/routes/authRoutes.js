const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  sequelize,
  Organization,
  User,
} = require("../models");
const router = express.Router();
// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password, organizationName } = req.body;

  if (
    !name?.trim() ||
    !email?.trim() ||
    !password ||
    !organizationName?.trim()
  ) {
    return res.status(400).json({
      message: "Name, email, password, and organization name are required.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "Authentication is not configured.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  let transaction;

  try {
    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    transaction = await sequelize.transaction();

    const organization = await Organization.create(
      { name: organizationName.trim() },
      { transaction }
    );

    const user = await User.create(
      {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        organizationId: organization.id,
      },
      { transaction }
    );

    await transaction.commit();

    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: organization.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: organization.id,
        organizationName: organization.name,
      },
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Signup error:", error.message);

    return res.status(500).json({
      message: "Unable to create account.",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "Authentication is not configured.",
    });
  }

  try {
    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() },
      include: [
        {
          model: Organization,
          as: "organization",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: user.organizationId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
});

module.exports = router;
