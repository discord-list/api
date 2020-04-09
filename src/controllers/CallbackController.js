const DiscordOauth2 = require("discord-oauth2")
const oauth = new DiscordOauth2()

const User = require('../models/User')

module.exports = {
  async store(req, res) {
    const { code } = req.body
	
	try {
		const tokens = await oauth.tokenRequest({
		  clientId: process.env.DISCORD_CLIENT_ID,
		  clientSecret: process.env.DISCORD_CLIENT_SECRET,
	  
		  code,
		  scope: process.env.DISCORD_OAUTH_SCOPE,
		  grantType: "authorization_code",
		  
		  redirectUri: process.env.DISCORD_OAUTH_REDIRECT
		})

		const user = await oauth.getUser(tokens.access_token)

		let dbUser = await User.findOne({ id: user.id })
		if (!dbUser) dbUser = await User.create({ id: user.id, ...tokens })
		else {
		  await dbUser.updateOne({ ...tokens })
		}

		oauth.addMember({
		  accessToken: tokens.access_token,
		  botToken: process.env.DISCORD_CLIENT_TOKEN,
		  guildId: '681445540005019688',
		  userId: user.id
		})

		return res.json({ token: dbUser._id })
	} catch {
		return res.status(401).json({ error: 401, message: "Unauthorized" })
	}
  }
}