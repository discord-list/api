const Bot = require('../models/Bot')
const User = require('../models/User')

const client = require('../config/discord')

const tags = require('../tags.json')

module.exports = {
  async store(req, res) {
    const { owner, prefix, bibl, shortDescription, description, tags, invite, website, github, server, id } = req.body

	let botinfo

    try {
      botinfo = await client.users.fetch(id)
      if (!botinfo.bot) throw new Error()
    } catch {
      return res.status(401).json({ error: 401, message: "invalid-id" })
    }

    let bot = await Bot.findOne({ id })

    if (bot) return res.status(400).json({ error: 400, message: "bot-existes" })

    const user = await User.findById(owner)

    bot = await Bot.create({ owner: user.id, prefix, bibl, shortDescription, description, tags, invite, website, github, server, id })
	
	const channel = client.channels.cache.get('681451097688244254')
	
	channel.send(`<a:idle2:692465324662194306> <@${user.id}> enviou o bot \`${botinfo.tag}\` para aprovação!\n${process.env.FRONTEND_URL}/bots/${botinfo.id}`)

    return res.json(bot)
  },
  
  async show(req, res) {
    const { id } = req.params

    const bot = await Bot.findOne({ id })

    if (!bot) return res.status(404).json({ error: 404, message: "Not Found" })

    bot._doc._id = undefined
    bot._doc.__v = undefined
	  bot._doc.votes = bot.votes.length

    const info = await client.users.fetch(bot.id)

    bot._doc.username = info.username
    bot._doc.discriminator = info.discriminator
    bot._doc.avatar = info.displayAvatarURL()
    bot._doc.status = info.presence.status
    bot._doc.streaming = info.presence.activities.length > 0 && info.presence.activities[0].type === "STREAMING"

    bot._doc.tags = bot.tags.map(t => tags[bot.lang][t])

    if (!bot.invite) bot.invite = `https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot`

    return res.json(bot)
  },

  async index(req, res) {
    const bots = await Bot.find({ list: true })

    for (let i = 0; i < bots.length; i++) {
      bots[i]._doc._id = undefined
      bots[i]._doc.__v = undefined
      bots[i]._doc.votes = bots[i].votes.length
      bots[i]._doc.tags = bots[i].tags.map(t => tags[bots[i].lang][t])

      let info

      try {
        info = await client.users.fetch(bots[i].id)

        bots[i]._doc.username = info.username
        bots[i]._doc.discriminator = info.discriminator
        bots[i]._doc.avatar = info.displayAvatarURL()
        bots[i]._doc.status = info.presence.status

        if (!bots[i].invite) bots[i].invite = `https://discordapp.com/oauth2/authorize?client_id=${bots[i].id}&scope=bot`
      } catch {
        bots.splice(i, 1)
      }
    }

    return res.json(bots)
  },

  async update(req, res) {
    const { prefix, shortDescription, description, tags, invite, website, github, server } = req.body
    const { user_id, bot } = req.headers

    const user = await User.findById(user_id)

    if (!user) return res.status(400).json({ error: 400, message: "invalid-user" })

    const botinfo = await Bot.findOne({ id: bot })

    if (!botinfo) return res.status(400).json({ error: 400, message: "invalid-bot" })
    if (user.id !== botinfo.owner) return res.status(401).json({ error: 401, message: "user-isnt-owner" })

    if (prefix) botinfo.prefix = prefix
    if (shortDescription) botinfo.shortDescription = shortDescription
    if (description) botinfo.description = description

    if (tags !== undefined) botinfo.tags = tags
    if (invite !== undefined) botinfo.invite = invite
    if (website !== undefined) botinfo.website = website
    if (github !== undefined) botinfo.github = github
    if (server !== undefined) botinfo.server = server

    await botinfo.save()

    return res.json(botinfo)
  }
}