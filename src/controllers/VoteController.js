const Bot = require('../models/Bot')
const User = require('../models/User')

const client = require('../config/discord')

const voteTime = 43200000

module.exports = {
  async store(req, res) {
    const { bot: bot_id } = req.body
    const { user_id } = req.headers

    const user = await User.findById(user_id)
	
	if (!user) return res.status(400).json({ error: 400, message: "invalid-user" })
	
    const bot = await Bot.findOne({ id: bot_id })
	
	if (!bot) return res.status(400).json({ error: 400, message: "invalid-bot" })
	
	const vote = bot.votes.filter(v => v.user === user.id && voteTime - (Date.now() - v.date) > 0)[0]
	
	if (vote) return res.status(401).json({ error: 401, message: "user-has-voted" })

    bot.votes.push({ user: user.id })

		await bot.save()
		
		client.channels.cache.get('681451097688244254').send(`<a:birdUpvote:698941695034916905> <@${user.id}> votou no bot <@${bot.id}>`)

    return res.json({ success: true })
  },
  
  async show(req, res) {
	  const { bot: bot_id } = req.query
	  const { token, user: user_id } = req.headers
	  
	  let bot
	  let user
	  
	  if (bot_id) {
		bot = await Bot.findOne({ id: bot_id })
		user = await User.findById(user_id)
	  } else if (token) {
		  bot = await Bot.findById(token)
		  user = await User.findOne({ id: user_id })
	  }
	
	  if (!user) return res.status(400).json({ error: 400, message: "invalid-user" })
	  if (!bot) return res.status(400).json({ error: 400, message: "invalid-bot" })
		
	  const vote = bot.votes.filter(v => v.user === user.id && voteTime - (Date.now() - v.date) > 0)[0]
		
	  if (!vote) return res.json({ voted: false })
	  else return res.json({ voted: true, date: vote.date })
  }
}