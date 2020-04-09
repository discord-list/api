const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  access_token: String,
  expires_in: Number,
  refresh_token: String,
  scope: String,
  token_type: String,
  id: String
}, {
  timestamps: true
})

module.exports = mongoose.model('User', UserSchema)