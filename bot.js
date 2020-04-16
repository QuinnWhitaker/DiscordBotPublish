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

// Declare the list of all thumbs up and thumbs down votes
const yesNoVotes = [
	':thumbsup:',
	':thumbsup_tone1:',
	':thumbsup_tone2:',
	':thumbsup_tone3:',
	':thumbsup_tone4:',
	':thumbsup_tone5:',
	':thumbsdown:',
	':thumbsdown_tone1:',
	':thumbsdown_tone2:',
	':thumbsdown_tone3:',
	':thumbsdown_tone4:',
	':thumbsdown_tone5:',
];


// When the bot is ready 
client.on('ready', () => {
	
  console.log('I am ready!');
  
});

function formatPollString(vote_title, issued_by, vote_status, vote_dictionary) {
	
	var poll = 	'==== **VOTE: ' + vote_title 	+ '** ==== \n\n **Issued By:** ' 	+ issued_by + '\n' 
	poll += 	'\n**Status: ' 	+ vote_status 	+ '**\n\n'
	return poll
}

function updatePoll(message_id) {
	
	// Find the JSON file associated with the message_id
	// If it doesn't exist, throw an error and return
	
	// Otherwise
		// Get the pool of possible reactions from the JSON file
		
		// Declare newVoteDictionary and newVoteStatus variables
		
		// For each user with the Member class
			// If they have reacted to the poll with id = message_id
				// Find the latest reaction on that message by that user that is within the pool of possible reactions
				// Remove all other reactions on that message by that user that are within the pool of possible reactions
				// Update newVoteDictionary with key = [that user] to value = [that reaction]
			// Otherwise, update newVoteDictionary with key = [that user] to value = null
			
		// Determine whether the vote needs to be closed.
		// If the vote is NOT multipleChoice
			// Count the number of thumbs up symbols (of all types) as well as thumbs down symbols in the newVoteDictionary
		// Otherwise count the number of each unique reaction in the poll (from the pool of possible reactions)
		// If all votes of one type exceed the other by more than 50%, OR every possible voter has voted, close the poll by setting the newVoteStatus
		
		// Update the JSON file with the newVoteDictionary and newVoteStatus
}

// Whenever a user types a message
client.on('message', message => {
	
	// If the message starts with the prefix command
	if (message.content.startsWith(voteCommand)) {
		
		// Get all content of the message beyond the prefix.
		const postPreFix = message.content.replace(voteCommand, '');
		
		// Get the title of the vote (Same as postPreFix until multiple choice has been implemented)
		const voteTitle = postPreFix;
		
		const multipleChoice = false;
		
		// Declare the pool of possible votes.
		var possibleVotes = {}
		
		// If it is multiple choice
		if (multipleChoice) {
			// Grab each possible vote from the postPreFix
		} else {
			// Set the list of possible votes to thumbs up and thumbs down
			possibleVotes = yesNoVotes;
		}
		
		// Get the author of the message
		const issuedBy = message.author.toString();
		
		// Declare the status of the vote as ACTIVE
		var voteStatus = 'ACTIVE';
		
		var voteDictionary = {};
		
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
					
					this.pollId = messageID;
					
					this.multipleChoice = multipleChoice;
					
					this.possibleVotes = possibleVotes;
					
					this.voteTitle = voteTitle;
					
					this.issuedBy = issuedBy;
					
					this.voteStatus = voteStatus;
					
					this.voteDictionary = voteDictionary;
					
				}
				
				// Create a local JSON file documenting the poll and its contents

				var data = new JsonMessage();
				
				var json = JSON.stringify(data);
				
				console.log(json);	
				
				var path = '.\\votes\\' + messageID + '.json'
				
				const fs = require('fs');

				try {
					
					fs.writeFileSync(path, json);
					
				} catch (err) {
					
					console.error(err)
				
				}
				
				// Update the poll with the current vote status.
				updatePoll(messageID);
				
			}, rejectionReason => {
				// If the message failed to send
				
				console.log("Failed to create poll in active votes channel. Reason: ", rejectionReason);
			}
		);
		
	
		

		
	}
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('Njg1MzUxMTk3MDcwMDY1Njc1.XmIGIA.sgbayqZK1UY1A3KbBi5FJB3zwj4');

