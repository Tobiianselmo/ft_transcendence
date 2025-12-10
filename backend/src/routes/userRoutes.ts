 

import type { FastifyReply, FastifyRequest } from "fastify"
import { FastifyInstance } from "fastify";
import {
  loginUser,
  registerUser,
  verifyRegister,
  logoutUser,
  forgotPassword,
  resetPassword,
  resend2FACode,
  resendVerificationCode,
  googleOAuth,
  googleStart,
  searchUsers,
} from '../controllers/userController'

import {
  toggle2FA,
  updateDisplayName,
  updatePassword,
  deleteAccount,
  getUserHistory,
  getUserStats,
  getPublicProfile
} from '../controllers/profileControllers'

import {
	sendFriendRequest,
	acceptFriendRequest,
	rejectOrRemoveFriend,
	getFriendsList,
	getPendingsList
 } from "../controllers/friendsControllers";

import { verify2FA } from "../2fa/utils";
import { verifyCsrf, verifyToken } from "../middlewares/auth";
import { getQuery, runQuery } from "../db/utils"
import type { Friends, User } from "../types/types"
import { getIo } from "../socket";
import { getMyProfile } from "../controllers/profileControllers";
import { getUserAvatar, updateAvatar } from "../controllers/avatar";

export async function userRoutes(fastify: FastifyInstance) {
	fastify.post('/register', registerUser);
	fastify.post('/verify-register', verifyRegister);
	fastify.post('/login', loginUser);
	fastify.post('/verify-2fa', verify2FA);
	fastify.post('/logout', { preHandler: verifyToken }, logoutUser);
  fastify.post('/forgot-password', forgotPassword);
  fastify.post('/reset-password', resetPassword);
  fastify.post('/resend-2fa', resend2FACode);
  fastify.post('/resend-verification', resendVerificationCode);
	fastify.patch('/2fa/toggle', { preHandler: [ verifyToken, verifyCsrf ] }, toggle2FA);
	fastify.patch('/update-display-name', { preHandler: [ verifyToken, verifyCsrf ] }, updateDisplayName);
	fastify.patch('/update-password', { preHandler: [ verifyToken, verifyCsrf ] }, updatePassword);
  fastify.delete('/delete-account', { preHandler: [ verifyToken, verifyCsrf ] }, deleteAccount);
  fastify.post('/friends/request', { preHandler: verifyToken }, sendFriendRequest);
	fastify.post('/friends/accept', { preHandler: verifyToken }, acceptFriendRequest);
  fastify.post('/profile/update-avatar', { preHandler: [ verifyToken, verifyCsrf ]}, updateAvatar);
  fastify.get('/profile/avatar', { preHandler: verifyToken }, getUserAvatar);
	fastify.delete('/friends/remove', { preHandler: verifyToken }, rejectOrRemoveFriend);
	fastify.get('/friends/list', { preHandler: verifyToken }, getFriendsList);
	fastify.get('/friends/pendings', { preHandler: verifyToken }, getPendingsList);
  fastify.get('/profile/history', { preHandler: verifyToken }, getUserHistory);
  fastify.get('/profile/stats', { preHandler: verifyToken }, getUserStats);
  fastify.get('/users/search', { preHandler: verifyToken }, searchUsers);
  fastify.get('/users/:username/profile', { preHandler: verifyToken }, getPublicProfile);
  fastify.get('/auth/google/callback', googleOAuth);
  fastify.get('/auth/google/start', googleStart);
	fastify.get('/me', { preHandler: verifyToken }, getMyProfile);
  fastify.get('/friends/search', {preHandler: [verifyToken, verifyCsrf]}, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user as {user_id: number};
    const { displayName } = request.query as {displayName: string};

    if (!displayName) {
      return reply.status(400).send({ error: "Username query parameter is required" })
    }

    try {
      const foundUser = await getQuery<User>('SELECT user_id, display_name FROM users WHERE display_name = ?', [displayName]);

      if (!foundUser) {
        return reply.status(404).send({ error: "User not found" })
      }

      const existFriends = await getQuery<Friends>(`
        SELECT *
        FROM friends
        WHERE
        (user_id = ? AND friend_id = ? ) OR
        (user_id = ? AND friend_id = ?)`, 
        [userId.user_id, foundUser.user_id, foundUser.user_id, userId.user_id]);

      if (!existFriends){
        return reply.status(404).send({ error: "Add this user as a Friend to create a Chat" });
      }
      return reply.send(foundUser)
    } catch (error) {
      console.error("❌ Error en endpoint /friends/search:", error)
      return reply.status(500).send({ error: "Internal server error" })
    }
  },
  )

  fastify.post("/chats", { preHandler: [verifyToken, verifyCsrf]}, async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.body) {
      return reply.status(400).send({ error: "Missing body" });
    }
    
    const { otherUserId } = request.body as {otherUserId: number};  
    const currentUser = request.user as {user_id: number};

    const foundUser = await getQuery<User>('SELECT user_id, display_name FROM users WHERE user_id = ?', [otherUserId]);

    if (!otherUserId) {
      return reply.status(400).send({ error: "otherUserId is required" })
    }
  
    if (!foundUser) {
      return reply.status(404).send({ error: "The user to chat with does not exist" });
    }

    if (currentUser.user_id === otherUserId) {
      return reply.status(400).send({ error: "Cannot create chat with yourself" });
    }

    try {
      const existingChat = await getQuery(
        "SELECT chat_id, is_blocked, blocked_user FROM chat WHERE (user_one = ? AND user_two = ?) OR (user_one = ? AND user_two = ?)", 
        [currentUser.user_id, otherUserId, otherUserId, currentUser.user_id],
      )

      if (existingChat) {
        return reply.send({chatId: existingChat.chat_id, isBlocked: existingChat.is_blocked, blockedUser: existingChat.blocked_user});
      }

      const result = await runQuery(
        'INSERT INTO chat (user_one, user_two) VALUES (?, ?)',
        [currentUser.user_id, otherUserId],
      )
      const chatId = result
      const io = getIo();
      if (io) {
        const targetUser = await getQuery(
          'SELECT socket_id, display_name FROM users WHERE user_id = ?', [otherUserId]);
        const senderUser = await getQuery(
          'SELECT display_name, user_id FROM users where user_id = ?', [currentUser.user_id]);
        if (targetUser && targetUser.socket_id) {
          io.to(targetUser.socket_id).emit('chatInvitation', {
            chat_id: chatId, 
            from_user: senderUser.display_name,
            from_user_id: senderUser.user_id,
            message: "New Chat invitation!",
          });
        }

        const creatorSocket = await getQuery('SELECT socket_id FROM users WHERE user_id = ?', [currentUser.user_id]);
        if (io && creatorSocket?.socket_id) {
          io.to(creatorSocket.socket_id).emit('chatCreated', {
            chat_id: chatId,
            other_display_name: targetUser?.display_name,
            success: true,
            message: "Chat created successfully!",
          });
          io.sockets.sockets.get(creatorSocket.socket_id)?.join(`chat-${chatId}`);
        }
      }
      return (
        reply.status(201).send({chatId: chatId}))
    } catch (error) {
      console.error("❌ Error creando chat:", error)
      return reply.status(500).send({ error: "Internal server error" })
    }
  },
  )
}
