const User = require('../models/User')
const Bot = require('../models/Bot')
const client = require('../config/discord')

module.exports = {
  async store(req, res) {
    const { user_id } = req.headers
    const { bot_id } = req.body

    const tokens = await User.findById(user_id)

    if (!tokens) return res.status(401).json({ error: 401, message: "invalid-user" })

    const guild = client.guilds.cache.get('681445540005019688')

    const member = guild.members.cache.get(tokens.id)

    if (!member || !member.roles.cache.has('692457598108041267')) return res.status(401).json({ error: 401, message: "Unauthorized" })

    const bot = await Bot.findOne({ id: bot_id })

    if (!bot || bot.list) return res.status(401).json({ error: 401, message: "invalid-bot" })

    const botMember = guild.members.cache.get(bot_id)
    
    if (!botMember) return res.status(400).send({ error: 400, message: "add-bot" })

    await botMember.roles.remove('681459932834430984')

    bot.list = true

    await bot.save()

    const channel = client.channels.cache.get('681451097688244254')
    const owner = client.users.cache.get(bot.owner)

    channel.send(`<a:online2:692465324737691708> O bot ${botMember.user}, enviado por ${owner}, foi aceite por ${member.user}\n${process.env.FRONTEND_URL}/bots/${botMember.user.id}`)

    if (owner) {
      owner.send(`O seu bot \`${botMember.user.tag}\` foi aceite! :tada:\n${process.env.FRONTEND_URL}/bots/${botMember.user.id}`)

      const ownerMember = guild.member(owner)

      if (ownerMember) ownerMember.roles.add('681453865647734808')
    }

    return res.json({ success: true })
  },

  async delete(req, res) {
    const { user_id } = req.headers
    const { bot_id, motivo } = req.body

    const tokens = await User.findById(user_id)

    if (!tokens) return res.status(401).json({ error: 401, message: "invalid-user" })

    const guild = client.guilds.cache.get('681445540005019688')

    const member = guild.members.cache.get(tokens.id)

    if (!member || !member.roles.cache.has('692457598108041267')) return res.status(401).json({ error: 401, message: "Unauthorized" })

    const bot = await Bot.findOne({ id: bot_id })

    if (!bot || bot.list) return res.status(401).json({ error: 401, message: "invalid-bot" })

    const botMember = guild.members.cache.get(bot_id)
    const botUser = await client.users.fetch(bot_id)

    if (botMember) await botMember.kick(motivo)

    await bot.remove()

    const channel = client.channels.cache.get('681451097688244254')
    const owner = client.users.cache.get(bot.owner)

    channel.send(`<a:dnd2:692465324477382698> O bot \`${botUser.tag}\`, enviado por ${owner}, foi recusado por ${member.user}\n**Motivo:**\n\`\`\`${motivo || "Nenhum motivo indicado"}\`\`\``)

    if (owner) owner.send(`O seu bot \`${botUser.tag}\` foi recusado! ☹️\n**Motivo:**\n\`\`\`${motivo || "Nenhum motivo indicado"}\`\`\``)

    return res.json({ success: true })
  }
}