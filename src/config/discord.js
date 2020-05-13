const Discord = require('discord.js')
const client = new Discord.Client()

const Bot = require('../models/Bot')

client.on('guildMemberRemove', async member => {
  if (member.user.bot) {
    const bot = await Bot.findOne({ id: member.id })

    bot.remove()

    const channel = client.channels.cache.get('681451097688244254')
    const owner = client.users.cache.get(bot.owner)

    channel.send(`<a:dnd2:692465324477382698> O bot \`${member.user.tag}\`, enviado por ${owner}, foi removido por ${client.user}\n**Motivo:**\n\`\`\`O bot saiu/foi removido do servidor\`\`\``)
  }
})

client.login(process.env.DISCORD_CLIENT_TOKEN)

module.exports = client