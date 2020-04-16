'use strict';

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

// The id of the channel where active votes will be posted.
// const voteChannelId = '677690362029932594'; // Main channel - comment out when testing
const voteChannelId = '685413820096577573'; // Test channel - comment out when deploying

// The id of the Member role, the role that voters must have to participate in the vote.
const memberID = '677562715799027713';

// Declare the prefix command for voting
const voteCommand = '!vote1 ';

// What does it say next to someone's name when they haven't voted?
const noVote = 'No Vote';

// Declare the list of all thumbs up and thumbs down votes
const yesNoVotes = {
	':thumbsup:': 			'Yay',
	':thumbsup_tone1:': 	'Yay',
	':thumbsup_tone2:': 	'Yay',
	':thumbsup_tone3:': 	'Yay',
	':thumbsup_tone4:': 	'Yay',
	':thumbsup_tone5:': 	'Yay',
	':thumbsdown:': 		'Nay',
	':thumbsdown_tone1:': 	'Nay',
	':thumbsdown_tone2:': 	'Nay',
	':thumbsdown_tone3:': 	'Nay',
	':thumbsdown_tone4:': 	'Nay',
	':thumbsdown_tone5:': 	'Nay'
};


// When the bot is ready 
client.on('ready', () => {
	
  console.log('I am ready!');
  
});

function formatPollString(vote_title, issued_by, vote_status, possible_votes, vote_dictionary) {
	
	var poll = 	'==== **VOTE: ' + vote_title 	+ '** ==== \n\n **Issued By:** ' 	+ issued_by + '\n\n' 
	poll +=		'OPTIONS: (React to this message with one of the following emojis)\n'
	
	if (possible_votes === yesNoVotes) {
		
		poll += ':thumbsup: : Yay\n'
		poll += ':thumbsdown: : Nay\n\n'
		
		poll += 'CURRENT VOTES: \n'
		vote_dictionary.forEach( function(vote, member) {
			poll += member.toString() + ' : ' + vote + '\n';
		});
	}
	
	poll += 	'\n**Status: ' 	+ vote_status 	+ '**\n\n'
	
	return poll;
}

function updatePoll(message) {
	
	// Find the JSON file associated with the message_id
	const fs = require('fs')

	const path = '.\\votes\\' + message.id + '.json'

	try {
		
		// If the JSON exists
		if (fs.existsSync(path)) {
			
			// Import the JSON file
			let rawdata = fs.readFileSync(path);
			let this_poll = JSON.parse(rawdata);
			console.log(this_poll);
			
			// Get the pool of possible reactions from the JSON file
			const possible_reactions = this_poll.possibleVotes;
			
			// Declare dictionary variable, to eventually replace that in the JSON
			var newVoteDictionary = {};
			
			// For each user with the Member class
			message.guild.roles.resolve(memberID).members.forEach(function (guildMember) {
				
				const user = guildMember.user;
				
				var userReacted = false;
				
				// See if that user has reacted to this message (For now, assume NO)
				
				// For each messageReaction in the ReactionManager of this message
				/*
				message.reactions.cache.forEach(function (messageReaction) {
					// If the list of possibleReactions includes the name of the emoji of this messageReaction
						// If this user exists within the users cache of this MessageReaction
							// Return true
					
				});
				*/
					
				
				// If they have reacted to the poll
				if (userReacted) {
					// Find the latest reaction on that message by that user that is within the pool of possible reactions
					// Remove all other reactions on that message by that user that are within the pool of possible reactions
					// Update newVoteDictionary with key = [that user] to value = [that reaction]
				} else {
					// update newVoteDictionary with key = [that user] to value = noVote
					newVoteDictionary[user] = noVote;
				}
			});
				
				
			// Determine whether the vote needs to be closed.
			// If the vote is NOT multipleChoice
				// Count the number of thumbs up symbols (of all types) as well as thumbs down symbols in the newVoteDictionary
			// Otherwise count the number of each unique reaction in the poll (from the pool of possible reactions)
			// If all votes of one type exceed the other by more than 50%, OR every possible voter has voted, close the poll by setting the newVoteStatus
			
			// Update the JSON file with the newVoteDictionary and newVoteStatus

			this_poll.voteDictionary = newVoteDictionary;
			
			console.log(this_poll);
			
			var json = JSON.stringify(this_poll);

			try {
				
				fs.writeFileSync(path, json);
				
			} catch (err) {
				
				console.error(err)
			
			}
			
			// Update the poll message content with the new information
			
			try {
				
				message.edit(formatPollString(this_poll.voteTitle, this_poll.issuedBy, this_poll.voteStatus, this_poll.possibleVotes, this_poll.voteDictionary));
				
			} catch (err) {
				
				console.error(err)
			
			}
		}
		
	// If the JSON doesn't exist
	} catch(err) {
		
		console.error(err)
		
	}
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
		
		// Attempt to send the sendString message to the active vote channel 
		let promisedMessage = client.channels.resolve(voteChannelId).send('.');
			
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
				
				var path = '.\\votes\\' + messageID + '.json'
				
				const fs = require('fs');

				try {
					
					fs.writeFileSync(path, json);
					
				} catch (err) {
					
					console.error(err)
				
				}
				
				// Update the poll with the current vote status.
				updatePoll(resultingMessage);
				
			}, rejectionReason => {
				// If the message failed to send
				
				console.log("Failed to create poll in active votes channel. Reason: ", rejectionReason);
			}
		);
		
	
		

		
	}
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('Njg1MzUxMTk3MDcwMDY1Njc1.XmIGIA.sgbayqZK1UY1A3KbBi5FJB3zwj4');

