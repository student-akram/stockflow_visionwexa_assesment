
const sequelize = require("../config/database");

const Organization = require("./Organization");
const User = require("./User");
const Product = require("./Product");

// One organization has one owner.
Organization.hasOne(User, {
  foreignKey: {
    name: "organizationId",
    allowNull: false,
  },
  as: "owner",
  onDelete: "CASCADE",
});

// Each user belongs to one organization.
User.belongsTo(Organization, {
  foreignKey: {
    name: "organizationId",
    allowNull: false,
  },
  as: "organization",
});

// One organization has many products.
Organization.hasMany(Product, {
  foreignKey: {
    name: "organizationId",
    allowNull: false,
  },
  as: "products",
  onDelete: "CASCADE",
});

// Each product belongs to one organization.
Product.belongsTo(Organization, {
  foreignKey: {
    name: "organizationId",
    allowNull: false,
  },
  as: "organization",
});

module.exports = {
  sequelize,
  Organization,
  User,
  Product,
};
