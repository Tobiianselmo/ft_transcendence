import type { FastifyReply, FastifyRequest } from "fastify"
import { runQuery, getQuery, getAll } from "../db/utils"
import type { User, Friends } from "../types/types"

export const sendFriendRequest = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { requesterName, receiverName } = request.body as { requesterName: string; receiverName: string }

  try {
    if (requesterName === receiverName) {
      return reply.status(400).send({ error: "You cannot send a friend request to yourself" })
    }

    const requester = await getQuery<User>("SELECT * FROM users WHERE display_name = ?", [requesterName])
    const receiver = await getQuery<User>("SELECT * FROM users WHERE display_name = ?", [receiverName])

    if (!requester || !receiver) {
      return reply.status(404).send({ error: "User not found" })
    }

    const exists = await getQuery(
      `SELECT * FROM friends
	  WHERE (user_id = ? AND friend_id = ?)
	  OR (user_id = ? AND friend_id = ?)`,
      [requester.user_id, receiver.user_id, receiver.user_id, requester.user_id],
    )

    if (exists) {
      return reply.status(400).send({ error: "Friend request already exists or users are already friends" })
    }

    await runQuery(
      "INSERT INTO friends (user_id, friend_id, requester_id, friend_state) \
	  VALUES (?, ?, ?, 'pending')",
      [requester.user_id, receiver.user_id, requester.user_id],
    )

    return reply.status(200).send({ message: "Friend request sent" })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: "Internal server error" })
  }
}

export const acceptFriendRequest = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { requesterName, receiverName } = request.body as { requesterName: string; receiverName: string }

  try {
    const requester = await getQuery<User>("SELECT * FROM users WHERE display_name = ?", [requesterName])
    const receiver = await getQuery<User>("SELECT * FROM users WHERE display_name = ?", [receiverName])

    if (!requester || !receiver) {
      return reply.status(404).send({ error: "User not found" })
    }

    const exists = await getQuery<Friends>(
      `SELECT * FROM friends
			WHERE user_id = ? AND friend_id = ?	AND friend_state = 'pending'`,
      [requester.user_id, receiver.user_id],
    )

    if (!exists) {
      return reply.status(400).send({ error: "No pending friend request found from this user" })
    }

    await runQuery(
      `UPDATE friends
			SET friend_state = 'accepted'
			WHERE user_id = ? AND friend_id = ?`,
      [requester.user_id, receiver.user_id],
    )

    return reply.status(200).send({ message: "Friend request accepted" })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: "Internal server error" })
  }
}

export const rejectOrRemoveFriend = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { requesterName, receiverName } = request.body as { requesterName: string; receiverName: string }

  try {
    const requester = await getQuery<User>("SELECT * FROM users WHERE display_name = ?", [requesterName])
    const receiver = await getQuery<User>("SELECT * FROM users WHERE display_name = ?", [receiverName])

    if (!requester || !receiver) {
      return reply.status(404).send({ error: "User not found" })
    }

    const exists = await getQuery<Friends>(
      `SELECT * FROM friends
			WHERE (user_id = ? AND friend_id = ?)
			OR (user_id = ? AND friend_id = ?)`,
      [requester.user_id, receiver.user_id, receiver.user_id, requester.user_id],
    )

    if (!exists) {
      return reply.status(400).send({ error: "No friend relationship found" })
    }

    await runQuery(
      `DELETE FROM friends
			WHERE (user_id = ? AND friend_id = ?)
			OR (user_id = ? AND friend_id = ?)`,
      [requester.user_id, receiver.user_id, receiver.user_id, requester.user_id],
    )

    const message = exists.friend_state === "pending" ? "Friend request rejected" : "Friend removed"

    return reply.status(200).send({ message })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: "Internal server error" })
  }
}

export const getFriendsList = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as { user_id: number }

  if (!user) {
    return reply.status(401).send({ error: "Unauthorized" })
  }

  try {
    const friendsList: Friends[] = await getAll<Friends>(
      `SELECT u.user_id, u.display_name, u.email
			FROM friends f
			JOIN users u
			ON (u.user_id = f.friend_id OR u.user_id = f.user_id)
			WHERE (f.user_id = ? OR f.friend_id = ?)
			AND f.friend_state = 'accepted'
			AND u.user_id != ?`,
      [user.user_id, user.user_id, user.user_id],
    )

    return reply.status(200).send(friendsList)
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: "Internal server error" })
  }
}

export const getPendingsList = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as { user_id: number }

  if (!user) {
    return reply.status(401).send({ error: "Unauthorized" })
  }

  try {
    const pendingsList: any[] = await getAll(
      `SELECT u.display_name, u.email, u.user_id
			FROM friends f
			JOIN users u ON u.user_id = f.user_id
			WHERE f.friend_id = ? AND f.friend_state = 'pending'`,
      [user.user_id],
    )

    return reply.status(200).send(pendingsList)
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: "Internal server error" })
  }
}
