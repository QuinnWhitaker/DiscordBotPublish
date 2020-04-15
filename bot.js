'use strict';

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
 
client.on('ready', () => {
	
  console.log('I am ready!');
  
});

// Create an event listener for messages
client.on('message', message => {
	
	var voteCommand = '!vote1 ';
	
	if (message.content.startsWith(voteCommand)) {
		
		var fs = require('fs');

		fs.appendFile('mynewfile1.txt', 'Hello content!', function (err) {
			
			if (err) throw err;
		  
			console.log('Saved!');
		  
		});
		
	}
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('Njg1MzUxMTk3MDcwMDY1Njc1.XmIGIA.sgbayqZK1UY1A3KbBi5FJB3zwj4');

