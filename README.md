# DiscordPollBot

A simple bot for the Discord messaging app that allows users in a channel to submit a poll that other users can vote on.

To call the bot, submit the following command:

	!vote [Your poll question]
	
The bot will then send a message to a separate channel, where users can react to the message using the thumbs up or thumbs down reaction. Once all the possible votes have been cast, the bot tallys the votes, and then deletes the poll, sending a new message to the concluded votes channel.

