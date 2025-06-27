const mongoose = require("mongoose")
const User = require(".")

const ClientSchema = new mongoose.Schema({

  subscriptionPlan: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  subscriptionStartDate: {
    type: Date
  },
  subscriptionEndDate: {
    type: Date
  },
  documentsGenerated: {
    type: Number,
    default: 0
  },
  monthlyDocumentLimit: {
    type: Number,
    default: 5
  },
  companyName: {
    type: String
  },
  industry: {
    type: String
  },
  membershipDate: {
    type: Date,
    default: Date.now
  }
})

ClientSchema.set("timestamps", true)
ClientSchema.set("toJSON", { virtuals: true })
ClientSchema.set("toObject", { virtuals: true })

module.exports = User.discriminator("Client", ClientSchema)

