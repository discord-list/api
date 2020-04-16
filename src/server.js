require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

mongoose.connect(process.env.MONGOOSE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.disable('x-powered-by')

app.use(cors())
app.use(express.json())

app.use(require('./routes'))

app.listen(process.env.PORT)