const mongoose = require('mongoose')

const BotSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  bibl: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [String],
  invite: String,
  website: String,
  github: String,
  server: String,
  id: {
    type: String,
    required: true
  },
  list: {
    type: Boolean,
    default: false
  },
  votes: [{
    user: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now()
    }
  }]
})

module.exports = mongoose.model('Bots', BotSchema)