import { Server as IOServer, Socket } from "socket.io";
import { runQuery, getQuery, getAllResults } from "../db/utils";
import xss from "xss";

export async function updateGeneralChatUsers() {
	const verifiedUsers = await getAllResults('SELECT display_name FROM users WHERE is_verified = true');
	if (!verifiedUsers || verifiedUsers.length === 0) {
		 
		return ;
	}
	
	const generalChatId = await getGeneralChatID();
	if (generalChatId === -1) {
		 
		return ;
	}
	
	const newUsersList = verifiedUsers.map(u => u.display_name).join(',');

	await runQuery('UPDATE chat SET users = ? WHERE chat_id = ?', [newUsersList, generalChatId]);
	 
}

export async function isInGeneralChat(username: string, chatId: number): Promise<boolean>
{
	if (chatId === -1) return false;

	const tmp = await getQuery('SELECT users FROM chat WHERE chat_id = ? AND generalChat = true', [chatId]);
	const generalChatUsers = tmp.users as string;
	const splittedResult = generalChatUsers.split(",");
	for (let i = 0; i < splittedResult.length; i++)
	{
		if (splittedResult[i] === username) {
			return true;
		}
	}
	return false;
}

export async function getGeneralChatID(): Promise<number>
{
	const generalChat = await getQuery('SELECT chat_id FROM chat WHERE generalChat = true LIMIT 1');
	if (generalChat)
		return generalChat.chat_id;
	return -1;
}

export async function deleteFromGeneralChat(username: string, chatId: number)
{
	if (chatId === -1) return;
	
	const tmp = await getQuery('SELECT users FROM chat WHERE chat_id = ? AND generalChat = true', [chatId]);
	const generalChatUsers = tmp.users as string;
	const splittedResult = generalChatUsers.split(",");
	let newUsers = "";
	for (let i = 0; i < splittedResult.length; i++)
	{
		const temp = newUsers;
		if (splittedResult[i] !== username && splittedResult[i] !== "")
			newUsers = temp + "," + splittedResult[i];
	}
	 
	await runQuery('UPDATE chat SET users = ? WHERE chat_id = ?', [newUsers, chatId]);
}


 
export async function chatHandlers(io: IOServer, socket: Socket) {
	const userId = socket.data.user.user_id;

	const getCurrentUser = async () => {
		const user = await getQuery('SELECT user_id, display_name FROM users WHERE user_id = ?', [userId]);
		if (!user) {
			 
			return;
		}
		return user;
	}

	const initialUser = await getCurrentUser();
	if (!initialUser) {
		return;
	}
	const user = initialUser;

	socket.on('joinChat', (chatId: number) => {
		socket.join(`chat-${chatId}`);
	})

	socket.on('chatList', async (userId: number) => {
		const user = await getCurrentUser();
		if (!user) {
			 
			return;
		}
		 

		const result = await getAllResults(
			'SELECT chat_id, generalChat, user_one, user_two FROM chat WHERE user_one = ? OR user_two = ? OR generalChat = true', [userId, userId]);
		 
		const chats = await Promise.all(result.map(async (chat: any) => {
			if (chat.generalChat) {
				return {
					chat_id: chat.chat_id,
					generalChat: true,
					other_display_name: "General"
				};
			} else {
				
				const otherUserId = chat.user_one === userId ? chat.user_two : chat.user_one;
				const otherUser = await getQuery(
					'SELECT display_name FROM users WHERE user_id = ?',
					[otherUserId]
				);
				return {
					chat_id: chat.chat_id,
					generalChat: false,
					other_display_name: otherUser?.display_name || "Unknown"
				};
			}
	 	}));
		chats.forEach(c => {
			socket.join(`chat-${c.chat_id}`);
		});
		 
		 
		socket.emit('chatListResponse', chats);
	})

	socket.on('getUserData', async (username: string) => {
		const userData = await getQuery(
			'SELECT display_name, email FROM users WHERE display_name = ?', [username]
		);
		socket.emit('userDataResponse', userData);
	})

	socket.on('getMessages', async (chatId: number) => {
		const messages = await getAllResults(
			`SELECT m.content, u.display_name as from_name
			FROM messages m
			JOIN users u ON m.sender_id = u.user_id
			WHERE m.chat_id = ?
			ORDER BY m.sent_at ASC`,
			[chatId]
		);
		socket.emit('messagesList', messages);
	});

	socket.on('getGeneralId', async () => {
		const general_id = await getGeneralChatID();
		 
		socket.emit('generalIdResponse', { generalId: general_id});
	})

	socket.on('sendMessage', async ( data: { chatId: number, content: string } ) => {  
		if (!data.content || !data.content.trim()) {
			socket.emit('error', 'Empty message');
			return;
		}

		function sanitizeMessage(input: string): string {
			
			const cleaned = xss(input, {
				whiteList: {},  
				stripIgnoreTag: true,
				stripIgnoreTagBody: ['script', 'style']
			});
			
			const normalized = cleaned.replace(/\s+/g, ' ').trim();
			return normalized.slice(0, 500);
		}

		const safeContent = sanitizeMessage(data.content);
		if (!safeContent) {
			socket.emit('error', 'Message rejected');
			return;
		}
		 
		try {

            const chat = await getQuery(
                'SELECT user_one, user_two, generalChat FROM chat WHERE chat_id = ?',
                [data.chatId]
            );

            if (!chat) {
                socket.emit('error', 'Chat not found');
                return; 
            }
			
            const senderId = user.user_id;
            let receiverId = null;
			if (!chat.generalChat)
			{
				receiverId = (chat.user_one === senderId) 
				? chat.user_two : chat.user_one;
			}

            await runQuery(
                'INSERT INTO messages (chat_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)', 
                [data.chatId, senderId, receiverId, safeContent]
            );

			const display_sender_name = await getQuery("SELECT display_name FROM users WHERE user_id = ?", [senderId]);
            if (!display_sender_name) {
				socket.emit('error', 'Sender not found');
				return;
			}
			const messageData = {
				chat_id: data.chatId,
				from: senderId, 
				to: receiverId,
				from_name: display_sender_name.display_name,
				content: safeContent,
			}

            io.to(`chat-${data.chatId}`).emit('newMessage', messageData);
        } catch (error) {
         
            socket.emit('error', 'Failed to send message');
        }
	})

	socket.on('isInChat', async(chatID: number, user_id: number) => {
		const result = await getQuery('SELECT user_one, user_two FROM chat WHERE chat_id = ?', [chatID]);
		if (!result) {
			socket.emit('chatExists', false);
			return;
		}
		const isInChat = (result.user_one === user_id || result.user_two === user_id);
		socket.emit('chatExists', isInChat);
	})
	
	socket.on('getOnlineStatus', async (username: string) => {
		const online = await getQuery('SELECT is_online FROM users WHERE display_name = ?', [username]);
		if (!online) {
			socket.emit('error', 'User not found for online status');
			return;
		}
		socket.emit('onlineStatusResponse', { online: online.is_online });
	})

	socket.on('generalUsers', async () => {
		
		await updateGeneralChatUsers(); 
		 
		
        try {
            const generalId = await getGeneralChatID();
            if (generalId === -1) {
                socket.emit('generalUsersResponse', []);
                return;
            }
            const row = await getQuery('SELECT users FROM chat WHERE chat_id = ?', [generalId]);
            const raw = (row?.users as string) || "";
            const names = raw.split(',').map(s => s.trim()).filter(Boolean);
            if (names.length === 0) {
                socket.emit('generalUsersResponse', []);
                return;
            }
            
            const placeholders = names.map(() => '?').join(',');
            const usersData = await getAllResults(
                `SELECT display_name, socket_id FROM users WHERE display_name IN (${placeholders})`,
                names
            );
            const result = usersData.map((u: any) => ({
                display_name: u.display_name,
                online: !!u.socket_id
            }));
            socket.emit('generalUsersResponse', result);
        } catch (e) {
             
            socket.emit('generalUsersResponse', []);
        }
    })

	socket.on('blockUser', async (username: string) => {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			socket.emit('error', 'Current user not found');
			return;
		}

		const userId = await getQuery('SELECT user_id, socket_id FROM users WHERE display_name = ?', [username]);
		if (!userId) {
			socket.emit('error', 'User not found to block');
			return;
		}

		const chatId = await getQuery('SELECT chat_id FROM chat WHERE (user_one = ? AND user_two = ?) OR (user_one = ? AND user_two = ?)', [currentUser.user_id, userId.user_id, userId.user_id, currentUser.user_id]);
		if (!chatId) {
			 
			socket.emit('error', 'Chat not found');
			return;
		}
		 

		await runQuery('UPDATE chat SET is_blocked = true, blocked_user = ? WHERE chat_id = ?', [username, chatId.chat_id]);
		socket.emit('userBlocked', { username });
		socket.to(userId.socket_id).emit('youAreBlocked', { username: currentUser.display_name });
		 
	});

	socket.on('unblockUser', async (username: string) => {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			socket.emit('error', 'Current user not found');
			return;
		}
		const userId = await getQuery('SELECT user_id, socket_id FROM users WHERE display_name = ?', [username]);
		if (!userId) {
			socket.emit('error', 'User not found to block');
			return;
		}
		const chatId = await getQuery('SELECT chat_id FROM chat WHERE (user_one = ? AND user_two = ?) OR (user_one = ? AND user_two = ?)', [currentUser.user_id, userId.user_id, userId.user_id, currentUser.user_id]);
		if (!chatId) {
			socket.emit('error', 'Chat not found');
			return;
		}
		 

		await runQuery('UPDATE chat SET is_blocked = false, blocked_user = NULL WHERE chat_id = ?', [chatId.chat_id]);
		socket.emit('userUnblocked', { username });
		socket.to(userId.socket_id).emit('youAreUnblocked', { username: currentUser.display_name });
		 
	})

	socket.on('isBlocked', async (username: string) => {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			socket.emit('error', 'Current user not found');
			return;
		}
		const userId = await getQuery('SELECT user_id FROM users WHERE display_name = ?', [username]);
		if (!userId) {
			socket.emit('error', 'User not found to block');
			return;
		}
		const chatId = await getQuery('SELECT chat_id FROM chat WHERE (user_one = ? AND user_two = ?) OR (user_one = ? AND user_two = ?)', [currentUser.user_id, userId.user_id, userId.user_id, currentUser.user_id]);
		if (!chatId) {
			socket.emit('error', 'Chat not found');
			return;
		}
		const isBlocked = await getQuery('SELECT is_blocked, blocked_user FROM chat WHERE chat_id = ?', [chatId.chat_id]);
		socket.emit('isBlockedResponse', { isBlocked: isBlocked.is_blocked, blockedUser: isBlocked.blocked_user } );
	})

}
