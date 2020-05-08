const DiscordOauth2 = require("discord-oauth2")
const oauth = new DiscordOauth2()

const client = require('../config/discord')

const User = require('../models/User')
const Bot = require('../models/Bot')

module.exports = {
  async show(req, res) {
    const { user_id: user_token } = req.headers
    let { user: user_id } = req.query

    if (user_token) {
      const tokens = await User.findById(user_token)
    
      if (!tokens) return res.status(401).json({ error: 401, message: "Unauthorized" })

      user_id = tokens.id
    }

    const userinfo = await client.users.fetch(user_id)

    const user = {
      id: userinfo.id,
      username: userinfo.username,
      discriminator: userinfo.discriminator,
      avatar: userinfo.displayAvatarURL(),
      status: userinfo.presence.status,
      streaming: userinfo.presence.activities.length > 0 && userinfo.presence.activities.filter(p => p.type === "STREAMING").length > 0
    }

    const customstatus = userinfo.presence.activities.filter(a => a.type === "CUSTOM_STATUS")[0]

    user.customstatus = customstatus ? {
      emoji: customstatus.emoji ? {
        name: customstatus.emoji.name,
        id: customstatus.emoji.id,
        url: customstatus.emoji.url,
      } : null,
	  text: customstatus.state
    } : null

    const bots = await Bot.find({ owner: user_id })

    user.bots = []

    for (let i = 0; i < bots.length; i++) {
      const bot = bots[i]
      const botinfo = await client.users.fetch(bot.id)

      bot._doc._id = undefined
      bot._doc.__v = undefined
      bot._doc.votes = bot.votes.length

      bot._doc.username = botinfo.username
      bot._doc.discriminator = botinfo.discriminator
      bot._doc.avatar = botinfo.displayAvatarURL()
      bot._doc.status = botinfo.presence.status
      bot._doc.streaming = botinfo.presence.activities.length > 0 && botinfo.presence.activities[0].type === "STREAMING"

      user.bots.push(bot)
    }

    const member = client.guilds.cache.get('681445540005019688').members.cache.get(user.id)
    
    user.verificador = member !== undefined && member.roles.cache.has('692457598108041267')

    return res.json(user)
  }
}