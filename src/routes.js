const express = require('express')
const routes = express.Router()

const CallbackController = require('./controllers/CallbackController')
const UserController = require('./controllers/UserController')
const BotController = require('./controllers/BotController')
const VoteController = require('./controllers/VoteController')
const AcceptController = require('./controllers/AcceptController')

routes.get('/login', (req, res) => {
  const url = `https://discordapp.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${process.env.DISCORD_OAUTH_REDIRECT}&response_type=code&scope=${process.env.DISCORD_OAUTH_SCOPE}`

  return req.query.redirect !== undefined ? res.redirect(url) : res.json(url)
})

routes.get('/user', UserController.show)

routes.post('/bot', BotController.store)
routes.put('/bot', BotController.update)
routes.get('/bot/:id', BotController.show)
routes.get('/bots', BotController.index)

routes.post('/vote', VoteController.store)
routes.get('/voted', VoteController.show)

routes.post('/accept', AcceptController.store)
routes.post('/decline', AcceptController.delete)

routes.post('/callback', CallbackController.store)

module.exports = routes