 

import { Server as IOServer, Socket } from "socket.io";
import type { FastifyInstance } from "fastify";
import { GameManager } from "./game/GameManager";
import { chatHandlers } from "./chat/chat";
import { getQuery, runQuery } from "./db/utils";
 
import { isInGeneralChat, getGeneralChatID, deleteFromGeneralChat } from "./chat/chat";

let ioInstance: IOServer | undefined;

export function getIo() {
  if (!ioInstance) throw new Error("IO not initialized yet");
  return ioInstance;
}

export function emitUserUpdate(userId: number, updateType: 'display_name' | 'status' | 'verification', newValue: string, online: boolean) {
	const io = getIo();
	io.emit('userUpdated', {
		userId,
		updateType,
		newValue,
		online
	});
}

export const setupSocketIO = (fastify: FastifyInstance, server: any) => {
	 
	const io = new IOServer(server, {
		cors: {
			origin: true,
			 
			 
			 
			 
				 
				
			 
			 
			credentials: true
		}
	});
	
	ioInstance = io;

	 
	const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
		const result: Record<string, string> = {};
		if (!cookieHeader) return result;
		cookieHeader.split(';').forEach(part => {
			const [name, ...rest] = part.trim().split('=');
			if (name) result[name] = decodeURIComponent(rest.join('='));
		});
		return result;
	};

	io.use(async (socket: Socket, next: any) => {
		const cookies = parseCookies(socket.handshake.headers.cookie);
		const token = (socket.handshake.auth && (socket.handshake.auth as any).token) || cookies['token'];

		if (!token) {
			 
			return next(new Error('No token provided'));
		}

		try {
			const payload = await fastify.jwt.verify(token);
			socket.data.user = payload;  
			next();
		} catch (err) {
			next(new Error('Invalid token'));
		}
	});
	 
	const gameManager = new GameManager(io);

	 
	 
	 
	type Room = {
		id: string;
		mode: '1v1';
		players: Array<{ id: string; name: string; index: 0 | 1 }>;
		createdAt: number;
		started: boolean;
		config: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number } | null;
		gameId?: string;
	};

	const rooms = new Map<string, Room>();
	let waiting1v1: Socket | null = null;

	const createRoom = (p1: Socket, p2: Socket, config: Room['config'] = null): Room => {
		const id = Math.random().toString(36).slice(2);
		const r: Room = {
			id,
			mode: '1v1',
			players: [
				{ id: p1.id, name: p1.data.user.display_name, index: 0 },
				{ id: p2.id, name: p2.data.user.display_name, index: 1 },
			],
			createdAt: Date.now(),
			started: false,
			config,
			gameId: undefined,
		};
		rooms.set(id, r);
		p1.join(id);
		p2.join(id);
		return r;
	};

	 
	io.on('connection', async (socket: Socket) => {
		const user = socket.data.user;
		runQuery('UPDATE users SET socket_id = ?, is_online = true WHERE user_id = ?', [socket.id, user.user_id]);
		
		emitUserUpdate(user.user_id, 'status', user.display_name, true);  
		
		const chatID = await getGeneralChatID();
		
		const is_verify = await getQuery('SELECT is_verified FROM users WHERE user_id = ?', [user.user_id]);

		let generalChatCreated = false;

		if (chatID === -1)
		{
			const result = await runQuery('INSERT INTO chat (users, generalChat) VALUES (?, ?)', [user.display_name, true]);
			 
			generalChatCreated = true;
		}
		
		let chat_id = await getGeneralChatID();
		if (chat_id === -1) return ;
		
		if (await isInGeneralChat(user.display_name, chat_id) == false && is_verify?.is_verified == true)
		{
			const tmp = await getQuery('SELECT users FROM chat WHERE chat_id = ?', [chat_id]);
			const userInChat = tmp.users as string;

			const current = (userInChat || '').split(',').filter(Boolean);
			if (!current.includes(user.display_name)) {
				current.push(user.display_name);
				await runQuery('UPDATE chat SET users = ? WHERE chat_id = ?', [current.join(','), chat_id]);
			}
			 

			 
			if (generalChatCreated) {
				io.emit('generalChatCreated', { chat_id, creator: user.display_name });
			}
		}
		socket.join(`chat-${chat_id}`);  


		socket.emit('Welcome', `Welcome ${user.display_name}`);


		socket.on("userStatusChanged", async (data: {userId: number, isOnline: boolean}) => {
			const targetUser = await getQuery('SELECT display_name FROM users WHERE user_id = ?', [data.userId]);
			if (targetUser) {
				emitUserUpdate(data.userId, 'status', targetUser.display_name, data.isOnline);
			}
		});
		
		socket.on('relay:create_match', (data: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number }) => {
			try {
				const id = Math.random().toString(36).slice(2, 8).toUpperCase();
				const room: Room = {
					id,
					mode: '1v1',
					players: [{ id: socket.id, name: socket.data.user.display_name, index: 0 }],
					createdAt: Date.now(),
					started: false,
					config: { difficulty: data.difficulty, scoreLimit: Math.max(1, Math.min(21, Number(data.scoreLimit) || 3)) },
				};
				rooms.set(id, room);
				socket.join(id);
				socket.emit('relay:created', { roomId: id, config: room.config });
			} catch (e) {
				console.error('relay:create_match error', e);
			}
		});

		 
		socket.on('relay:join_match', (data: { roomId: string }) => {
			try {
				const room = rooms.get(data.roomId);
				if (!room) {
					return socket.emit('relay:join_error', { message: 'Room not found' });
				}
				if (room.players.length >= 2) {
					return socket.emit('relay:join_error', { message: 'Room full' });
				}
				room.players.push({ id: socket.id, name: socket.data.user.display_name, index: 1 });
				socket.join(room.id);
				io.to(room.id).emit('relay:ready', {
					roomId: room.id,
					players: room.players.map(p => ({ id: p.id, name: p.name, index: p.index })),
				});
				 
				const gameId2 = gameManager.createGame(false, { difficulty: room.config?.difficulty, scoreLimit: room.config?.scoreLimit });
				room.gameId = gameId2;
				room.players.forEach(p => {
					const s = io.sockets.sockets.get(p.id);
					if (s) gameManager.joinGame(gameId2, s, p.name);
				});
				room.started = true;
				io.to(room.id).emit('relay:start', { roomId: room.id, startTime: Date.now(), config: room.config });
			} catch (e) {
				console.error('relay:join_match error', e);
			}
		});

		socket.on('relay:leave_queue', () => {
			if (waiting1v1 && waiting1v1.id === socket.id) {
				waiting1v1 = null;
			}
		});

		socket.on('relay:input', (data: { roomId: string; tick?: number; dir: 'up' | 'down' | 'none' }) => {
			const room = rooms.get(data.roomId);
			if (!room) return;
			const player = room.players.find(p => p.id === socket.id);
			if (!player) return;
			 
			socket.to(data.roomId).emit('relay:input', {
				from: player.index,
				tick: data.tick ?? null,
				dir: data.dir,
				ts: Date.now(),
			});
		});

		socket.on('relay:ping', (clientTs: number) => {
			socket.emit('relay:pong', { clientTs, serverTs: Date.now() });
		});

		 
		socket.on('game:reset', (data: { gameId: string }) => {
			const ok = gameManager.resetGame(data.gameId);
			if (!ok) socket.emit('game:reset_error', { message: 'Cannot reset while game running or invalid game' });
		});

		chatHandlers(io, socket);

		socket.on('disconnect', async (reason: string) => {
			const user = socket.data.user;
			const connectionType = socket.handshake.query.type;
			 
			
			if (connectionType !== 'game') {	
				await runQuery('UPDATE users SET socket_id = NULL, is_online = false WHERE user_id = ?', [user.user_id]);
				emitUserUpdate(user.user_id, 'status', user.display_name, false);
			}

			
			if (waiting1v1 && waiting1v1.id === socket.id) {
				waiting1v1 = null;
			}
			 
			for (const [roomId, room] of rooms) {
				if (room.players.find(p => p.id === socket.id)) {
					io.to(roomId).emit('relay:player_left', { id: socket.id });
					rooms.delete(roomId);
				}
			}
		});

		 
        socket.on('game:create', (data: { isLocal: boolean }) => {
            const gameId = gameManager.createGame(data.isLocal);
            socket.emit('game:created', { gameId });
        });

         
        socket.on('game:join', (data: { gameId: string }) => {
            const joined = gameManager.joinGame(data.gameId, socket, user.display_name);
            if (!joined) {
                socket.emit('game:join_error', { message: 'Could not join game' });
            }
        });

	});

	return io;
}
