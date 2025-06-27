const mongoose = require("mongoose");
const User = require(".");

const AdminSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["super_admin", "admin"],
    default: "admin",
  },
  permissions: {
    type: [String],
  },
  lastAdminActionAt: {
    type: Date,
  },
  adminLevel: {
    type: Number,
    default: 1,
  },
  canManageUsers: {
    type: Boolean,
    default: true,
  },
  canManageDocuments: {
    type: Boolean,
    default: true,
  },
  canViewAnalytics: {
    type: Boolean,
    default: true,
  },
});

AdminSchema.set("timestamps", true);
AdminSchema.set("toJSON", { virtuals: true });
AdminSchema.set("toObject", { virtuals: true });

module.exports = User.discriminator("Admin", AdminSchema);
