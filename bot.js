'use strict';

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

// The id of the channel where active votes will be posted.
// const voteChannelId = '677690362029932594'; // Main channel - comment out when testing
const voteChannelId = '685413820096577573'; // Test channel - comment out when deploying

// Declare the prefix command for voting
const voteCommand = '!vote1 ';

// What does it say next to someone's name when they haven't voted?
const noVote = 'Vote Pending';


// When the bot is ready 
client.on('ready', () => {
	
  console.log('I am ready!');
  
});

function formatPollString(vote_title, issued_by, vote_status, vote_dictionary, ) {
	
	var poll = 	'==== **VOTE: ' + vote_title 	+ '** ==== \n\n **Issued By:** ' 	+ issued_by + '\n' 
	poll += 	'\n**Status: ' 	+ vote_status 	+ '**\n\n'

	return poll
}

// Whenever a user types a message
client.on('message', message => {
	
	// If the message starts with the prefix command
	if (message.content.startsWith(voteCommand)) {
		
		// Get all content of the message beyond the prefix.
		const postPreFix = message.content.replace(voteCommand, '');
		
		// Get the title of the vote (Same as postPreFix until multiple options have been implemented)
		const voteTitle = postPreFix;
		
		// Get the author of the message
		const issuedBy = message.author.toString();
		
		// Declare the status of the vote as ACTIVE
		var voteStatus = 'ACTIVE';
		
		var voteDictionary = 1;
		
		var sendString = formatPollString(voteTitle, issuedBy, voteStatus, voteDictionary);
		
		// Attempt to send the sendString message to the active vote channel 
		let promisedMessage = client.channels.resolve(voteChannelId).send(sendString);
			
		promisedMessage.then(

			resultingMessage => {
				// If the message successfully sent
				
				// Declare the ID of the new message
				const messageID = resultingMessage.id;
				
				console.log("Poll created. Message ID: ", messageID);
				
				// Declare the class that will be converted to a JSON object
				function JsonMessage() {
					
					this.voteTitle = voteTitle;
					
					this.issuedBy = issuedBy;
					
					this.voteStatus = voteStatus;
					
					this.voteDictionary = voteDictionary;
					
				}
				 
				var data = new JsonMessage();
				
				console.log(JSON.stringify(data));
				
				// Create a local JSON file documenting the poll and its contents
				
				var path = '.\votes'
				
				const fs = require('fs')

				const storeData = (data, path) => {
					
					try {
						
						fs.writeFileSync(path, JSON.stringify(data))
						
				  } catch (err) {
					  
					console.error(err)
					
				  }
				}
				
			}, rejectionReason => {
				// If the message failed to send
				
				console.log("Failed to create poll in active votes channel. Reason: ", rejectionReason);
			}
		);
		
	
		

		
	}
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('Njg1MzUxMTk3MDcwMDY1Njc1.XmIGIA.sgbayqZK1UY1A3KbBi5FJB3zwj4');

