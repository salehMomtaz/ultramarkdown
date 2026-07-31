import { api } from 'sdk';
import { addToWhitelist, removeFromWhitelist } from 'lib/whitelist';

const OWNER_ID = parseInt(process.env.OWNER_ID);

export default async function (message) {
  const userId = message.from.id;
  const command = message.text.split(' ')[0].toLowerCase();
  const args = message.text.split(' ').slice(1);

  if (userId !== OWNER_ID) {
    await api.sendMessage({
      chat_id: message.chat.id,
      text: "You are not authorized to use this command."
    });
    return;
  }

  try {
    switch (command) {
      case '/add':
        if (args.length < 1) {
          await api.sendMessage({
            chat_id: message.chat.id,
            text: "Please provide a user ID to add to the whitelist."
          });
          return;
        }
        const userToAdd = parseInt(args[0]);
        await addToWhitelist(userToAdd, args[1] || '');
        await api.sendMessage({
          chat_id: message.chat.id,
          text: `User ${userToAdd} has been added to the whitelist.`
        });
        break;

      case '/remove':
        if (args.length < 1) {
          await api.sendMessage({
            chat_id: message.chat.id,
            text: "Please provide a user ID to remove from the whitelist."
          });
          return;
        }
        const userToRemove = parseInt(args[0]);
        await removeFromWhitelist(userToRemove);
        await api.sendMessage({
          chat_id: message.chat.id,
          text: `User ${userToRemove} has been removed from the whitelist.`
        });
        break;

      default:
        await api.sendMessage({
          chat_id: message.chat.id,
          text: "Unknown command. Available commands: /add [user_id], /remove [user_id]"
        });
    }
  } catch (error) {
    await api.sendMessage({
      chat_id: message.chat.id,
      text: `Error processing command: ${error.message}`
    });
  }
}
