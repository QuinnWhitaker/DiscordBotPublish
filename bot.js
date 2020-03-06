'use strict';

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

const voteChannelId = '677690362029932594';
const memberRoleId = '677562715799027713';
const thumbsUp = '👍';
const thumbsDown = '👎';
const reactionList = [thumbsUp, thumbsDown];
const memberID = '677562715799027713';

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
  // If the message is "ping"
  var voteCommand = '!vote '
  if (message.content.startsWith(voteCommand)) {
	
	const title = message.content.replace(voteCommand, '');
	const issuedBy = message.author.toString();
	var voteStatus = 'ACTIVE'
	const noVote = "Vote Pending";
	var memberStatuses = new Object();
	var numberOfVotes = 0;
	
	function numKeys(o) {
	   var res = 0;
	   for (var k in o) {
		   if (o.hasOwnProperty(k)) res++;
	   }
	   return res;
	}
	
	message.guild.roles.resolve(memberID).members.forEach(function (guildMember) {
		memberStatuses[guildMember.user] = noVote;
	});
	
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
	
	var sendString = constructString(message);
	
	let promisedMessage = client.channels.resolve(voteChannelId).send(sendString);
	
	promisedMessage.then((resultingMessage) => {

		
		var reactedUser = null;
		
		const filter = (reaction, user) => {
			reactedUser = user;
			return (!user.bot) && (reactionList.includes(reaction.emoji.name));
			// check if the emoji is inside the list of emojis, and if the user is not a bot
		}
		
		const collector = resultingMessage.createReactionCollector(filter);
		
		collector.on('collect', (reaction) => {
			if (voteStatus === 'ACTIVE') {
					switch(reaction.emoji.name) {
						case thumbsUp:
							var hasThumbsDown = resultingMessage.reactions.resolve(thumbsDown)
							if (hasThumbsDown) {
								hasThumbsDown.users.remove(reactedUser);
							}
							memberStatuses[reactedUser] = thumbsUp;
							break;
							
						case thumbsDown:
							var hasThumbsUp = resultingMessage.reactions.resolve(thumbsUp)
							if (hasThumbsUp) {
								hasThumbsUp.users.remove(reactedUser);
							}
							memberStatuses[reactedUser] = thumbsDown;
							break;
				}
				numberOfVotes++;
				if (numberOfVotes == numKeys(memberStatuses)) {
					var numYes = 0;
					var hasThumbsUp = resultingMessage.reactions.resolve(thumbsUp)
					if (hasThumbsUp) {
						numYes = hasThumbsUp.count
					}
					var numNo = 0;
					var hasThumbsDown = resultingMessage.reactions.resolve(thumbsDown)
					if (hasThumbsDown) {
						numNo = hasThumbsDown.count
					}
					
					if (numYes > numNo) {
						voteStatus = 'PASSED'
					} else {
						voteStatus = 'FAILED'
					}
				}
				resultingMessage.edit(constructString(resultingMessage));
			}
		});
		
		client.on('messageReactionRemove', (reaction, user) => {
			if (voteStatus === 'ACTIVE') {
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
		});
	});
  }
  
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('Njg1MzUxMTk3MDcwMDY1Njc1.XmIGIA.sgbayqZK1UY1A3KbBi5FJB3zwj4');