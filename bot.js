'use strict';

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

// The id of the channel where active votes will be posted.
const voteChannelId = '677690362029932594';

// The id of the channel where votes will be recorded.
const recordChannelId = '687488031233540146';

// The id of the Member role, the role that each voter must have to be counted in and participate in the vote.
const memberID = '677562715799027713';

// The emojis of each vote type
const thumbsUp = '👍';
const thumbsDown = '👎';

// The list of approved reactions.
const reactionList = [thumbsUp, thumbsDown];


/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
	
  // The vote command the bot looks for
  var voteCommand = '!vote '
  
  // If the message starts with the vote command
  if (message.content.startsWith(voteCommand)) {
	
	// Get all content of the message other than the vote command. This will be the title of the vote.
	const title = message.content.replace(voteCommand, '');
	
	// Get the author of the message.
	const issuedBy = message.author.toString();
	
	// The current status of the vote. It begins as active, and will become either PASSED or FAILED when the vote is finished.
	var voteStatus = 'ACTIVE'
	
	// What does it say next to someone's name when they haven't voted yet?
	const noVote = "Vote Pending";
	
	// This is the key-value list of all statuses of each member. Their starting status will be whatever noVote says. When they vote, their status will be changed to their vote.
	var memberStatuses = new Object();
	
	// The current number of votes that have occured.
	var numberOfVotes = 0;
	
	// Whether the removal of a vote was a result of the program automatically changing a vote
	var swappedThumbs = false;
	
	// An overly complicated function to grab the length of the memberStatuses list.
	function numKeys(o) {
	   var res = 0;
	   for (var k in o) {
		   if (o.hasOwnProperty(k)) res++;
	   }
	   return res;
	}
	
	// When this vote is called, each member in the list of people with the members role is set to not have voted yet.
	message.guild.roles.resolve(memberID).members.forEach(function (guildMember) {
		memberStatuses[guildMember.user] = noVote;
	});
	
	// This function creates the string that will replace whatever the current active vote message is.
	function constructString(m) {
		var retString = '==== **VOTE: ' + title + '** ==== \n\n **Issued By:** ' + issuedBy + '\n\n' 
		for (var key in memberStatuses) {
			retString += key.toString() + ': ' + memberStatuses[key] + '\n'
		}
		retString += '\n**Status: ' + voteStatus + '** (' + numberOfVotes + '/' + numKeys(memberStatuses) + ')\n\n'
		
		if (voteStatus === 'ACTIVE') {
			retString += '*(To vote, react to this with ' + thumbsUp + ' or ' + thumbsDown + ')*'
		} else {
			retString += '*(This vote is now closed.)*'
		}
		return retString;
	}
	
	// To do: format this function like the records in #records
	function constructRecord(m) {
		var retString = '==== **VOTE: ' + title + '** ==== \n\n **Issued By:** ' + issuedBy + '\n\n' 
		for (var key in memberStatuses) {
			retString += key.toString() + ': ' + memberStatuses[key] + '\n'
		}
		retString += '\n**Status: ' + voteStatus + '** (' + numberOfVotes + '/' + numKeys(memberStatuses) + ')\n\n'
		
		if (voteStatus === 'ACTIVE') {
			retString += '*(To vote, react to this with ' + thumbsUp + ' or ' + thumbsDown + ')*'
		} else {
			retString += '*(This vote is now closed.)*'
		}
		return retString;
	}
	
	// sendString will contain the string that is eventually replacing the active vote's text.
	var sendString = constructString(message);
	
	// Attempt to send the sendString message to the active vote channel 
	let promisedMessage = client.channels.resolve(voteChannelId).send(sendString);
	
	// When the result is gathered
	promisedMessage.then(
		
		// If the result is a success
		(resultingMessage) => {
			
			// A user that reacted to the message
			var reactedUser = null;
			
			// Whenever a user reacts to the message
			const filter = (reaction, user) => {
				// If the user is not a bot and the reaction is included in the list of approved reactions, the filter will approve of the reaction.
				if ((!user.bot) && (reactionList.includes(reaction.emoji.name))) {
					// Save the reacted user to the variable
					reactedUser = user;
					return true;
				} else return false;
				
			}
			
			// Create a reaction collector variable with the above filter.
			const collector = resultingMessage.createReactionCollector(filter);
			
			// Whenever the collector receives an approved reaction
			collector.on('collect', (reaction) => {
				
				// If the vote is active we make modifications to the vote.
				if (voteStatus === 'ACTIVE') {
					
					// If this was the first vote the user made should the number of votes increase.
					if (memberStatuses[reactedUser] === noVote) {
						numberOfVotes++;
					}
					
					// Based on what the reaction is, a different type of vote will be added.
					switch(reaction.emoji.name) {
						// If the vote is a thumbs up
						case thumbsUp:
							// If the user already has a thumbs down vote
							var hasThumbsDown = resultingMessage.reactions.resolve(thumbsDown);
							if (hasThumbsDown) {
								// Remove the thumbs down vote
								swappedThumbs = true;
								hasThumbsDown.users.remove(reactedUser);
							}
							// Change the user's vote stuatus to thumbs up.
							memberStatuses[reactedUser] = thumbsUp;
							break;
						// If the vote is a thumbs down
						case thumbsDown:
							// If the user already has a thumbs up vote
							var hasThumbsUp = resultingMessage.reactions.resolve(thumbsUp);
							if (hasThumbsUp) {
								// Remove the thumbs up vote
								swappedThumbs = true;
								hasThumbsUp.users.remove(reactedUser);
							}
							// Change the user's vote status to thumbs down.
							memberStatuses[reactedUser] = thumbsDown;
							break;
					}
					
					// Count the number of "yes" and "no" votes
					
					var numYes = 0;
					var numNo = 0;
					
					for (var key in memberStatuses) {
						if (memberStatuses[key] === thumbsUp) numYes++;
						else if (memberStatuses[key] === thumbsDown) numNo++;
					}
					
					// If the number of votes equals the number of eligible voters OR the vote is already unanimous in the majority
					if (numberOfVotes == numKeys(memberStatuses) || (numYes > (numKeys / 2)) || (numNo > (numKeys / 2))) {

						// Only if the number of yes votes EXCEEDS the number of no votes will the vote pass
						// Ties will count as a failure
						if (numYes > numNo) {
							voteStatus = 'PASSED'
						} else {
							voteStatus = 'FAILED'
						}
					}
					
					// Update the message of the active vote
					resultingMessage.edit(constructString(resultingMessage));
				}
			});
			
			client.on('messageReactionRemove', (reaction, user) => {
				if (voteStatus === 'ACTIVE' && !swappedThumbs) {
					if (reaction.emoji.toString() === thumbsUp.toString() || reaction._emoji.toString() == thumbsDown.toString()) {
						if (reaction.emoji.toString() === thumbsUp.toString()) {
							console.log("removing thumbs up");
						}
						if (reaction._emoji.toString() == thumbsDown.toString()) {
							console.log("removing thumbs down");
						}
						memberStatuses[user] = noVote;
						numberOfVotes--;
						resultingMessage.edit(constructString(resultingMessage));
					}
				}
				
				swappedThumbs = false;
			});
			
		});
  }
  
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('Njg1MzUxMTk3MDcwMDY1Njc1.XmIGIA.sgbayqZK1UY1A3KbBi5FJB3zwj4');