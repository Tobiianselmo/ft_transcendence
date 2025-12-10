import { FastifyReply, FastifyRequest } from "fastify";
import { isStrongerPassword, isValidDisplayName } from "../utils/validators";
import bcrypt from "bcrypt";
import { runQuery, getQuery, getAll } from "../db/utils";
import { emitUserUpdate } from '../socket';
import fs from "fs";
import path from "path";
import xss from "xss";

import {
  User,
  Match,
  Opponent,
  MatchHistoryResponse,
  Stats
} from "../types/types";

export const toggle2FA = async (request: FastifyRequest, reply: FastifyReply) => {
  const user_id = request.user.user_id;

  try {
	const user = await getQuery<User>("SELECT * FROM users WHERE user_id = ?", [user_id]);

	if (!user) {
	  return reply.status(404).send({ error: "User not found" });
	}

	const newStatus = !user.twofa_enabled;
	await runQuery(
	  "UPDATE users SET twofa_enabled = ?, twofa_verified = false, twofa_code = NULL WHERE user_id = ?",
	  [newStatus, user_id]
	);

	return reply.send({
	  message: `2FA ${newStatus ? "enabled" : "disabled"}`,
	  twofa_enabled: newStatus,
	});
  } catch (err) {
	request.log.error(err);
	return reply.status(500).send({ error: "Internal server error" });
  }
};

export const updateDisplayName = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { display_name: newDisplayName } = request.body as { display_name?: string };
  const userId = request.user.user_id;
  const currentName = request.user.display_name;

  if (!newDisplayName) {
	return reply.status(400).send({ error: "Missing required fields" });
  }

  if (!isValidDisplayName(newDisplayName)) {
	return reply.status(400).send({
	  error: "Display name must contain only letters, numbers or underscores, and be at least 3 characters long"
	});
  }

  const safeDisplayName = xss(newDisplayName).trim();

  if (safeDisplayName === currentName) {
	return reply.status(200).send({ message: "Display name unchanged", display_name: currentName });
  }

  const exists = await getQuery("SELECT 1 FROM users WHERE display_name = ?", [safeDisplayName]);
  if (exists) {
	return reply.status(409).send({ error: "Display name already in use" });
  }

  try {
    const changes = await runQuery("UPDATE users SET display_name = ? WHERE user_id = ?", [safeDisplayName, userId]);

    if (!changes) {
      return reply.status(404).send({ error: "User not found" });
    }
    
    try {
      emitUserUpdate(userId, 'display_name', safeDisplayName, true);
    } catch (err) {
      console.error("Error emitting user update: ", err);
    }
    
    const token = await reply.jwtSign(
      { user_id: userId, display_name: safeDisplayName },
      { expiresIn: "1h" }
    );

    reply.setCookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600,
    });

    return reply.status(200).send({
      message: "Display name updated",
      display_name: safeDisplayName,
    });
  } catch (err: any) {
	request.log.error(err);
	return reply.status(500).send({ error: "Internal server error" });
  }
};

export const updatePassword = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { currentPassword, newPassword } = request.body as { currentPassword: string, newPassword: string };
  const user_id = request.user.user_id;

  if (!isStrongerPassword(newPassword)) {
	return reply.status(400).send({
	  error: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number",
	});
  }

  try {
	const user = await getQuery<User>("SELECT * FROM users WHERE user_id = ?", [user_id]);
	if (!user) {
	  return reply.status(401).send({ error: "User not found" });
	}

	const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
	if (!isMatch) {
	  return reply.status(401).send({ error: "Current password is incorrect" });
	}

	const newHash = await bcrypt.hash(newPassword, 10);
	await runQuery("UPDATE users SET password_hash = ? WHERE user_id = ?", [newHash, user_id]);

	return reply.status(200).send({ message: "Password updated successfully" });
  } catch (err) {
	console.error("Error updating password:", err);
	return reply.status(500).send({ error: "Internal server error" });
  }
};

export const deleteAccount = async (request: FastifyRequest, reply: FastifyReply) => {
  const user_id = request.user.user_id;
  
  const cookieOptions = {
	path: "/",
	httpOnly: true,
	secure: false,
	sameSite: "strict" as const,
  };
  
  const csrfCookieOptions = {
	path: "/",
	httpOnly: false,
	secure: false,
	sameSite: "strict" as const,
  };

  try {
	reply
	.clearCookie("token", cookieOptions)
	.clearCookie("csrf_token", csrfCookieOptions)
	.clearCookie("session_id", cookieOptions);

	await runQuery("DELETE FROM users WHERE user_id = ?", [user_id]);
	
	return reply.status(200).send({ message: "Account deleted successfully" });
  } catch (err) {
	console.error("Error deleting account:", err);
	return reply.status(500).send({ error: "Internal server error" });
  }
};

export const getUserHistory = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as User;

  if (!user) {
	return reply.status(401).send({ error: "Unauthorized" });
  }

  try {
	const matches = await getAll<Match>(
	"SELECT m.match_id, m.played_at, mp.user_id, mp.score, mp.result\
	FROM match_players mp\
	JOIN matches m ON mp.match_id = m.match_id\
	WHERE mp.user_id = ?\
	ORDER BY m.played_at DESC", [user.user_id]);

	if (matches.length === 0) {
	  return reply.status(200).send([]);
	}

	const history: MatchHistoryResponse[] = [];
  for (const match of matches) {
    const opponentsRaw = await getAll<Opponent>(
    "SELECT u.display_name, mp.score, mp.result\
    FROM match_players mp\
    LEFT JOIN users u ON mp.user_id = u.user_id\
    WHERE mp.match_id = ? AND mp.user_id != ?", [match.match_id, user.user_id]);

    const opponents = opponentsRaw.map(o => ({
    display_name: o.display_name ?? null,
    score: o.score,
    result: o.result,
    }));

    history.push({
      match_id: match.match_id,
      played_at: match.played_at,
      user: { score: match.score, result: match.result },
      opponents,
    });

  }

	return reply.status(200).send(history);
  } catch (err) {
	console.error(err);
	return reply.status(500).send({ error: "Error fetching profile history" });
  }
};

export const getUserStats = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as User;

  if (!user) {
	return reply.status(401).send({ error: "Unauthorized" });
  }

  try {
	const stats = await getQuery<Stats>("SELECT * FROM stats WHERE user_id = ?", [user.user_id]);

	if (!stats) {
	  const emptyStats: Stats = {
		user_id: user.user_id,
		games_played: 0,
		games_won: 0,
		lost_games: 0,
	  };
	  return reply.status(200).send(emptyStats);
	}

	return reply.status(200).send(stats);
  } catch (err) {
	console.error(err);
	return reply.status(500).send({ error: "Error fetching profile results" });
  }
}

export const getPublicProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  const { username } = request.params as { username: string };
  const currentUser = request.user as User | undefined;

  try {
    const user = await getQuery<User>(
      "SELECT * FROM users WHERE display_name = ?",
      [username]);
    
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const uploadsRoot = process.env.UPLOADS_DIR
      ? path.resolve(process.env.UPLOADS_DIR)
      : path.join(__dirname, "../uploads");

    let avatar_url = user.avatar || "/uploads/default.jpg";
    if (avatar_url.startsWith("/uploads/")) {
      const localPath = path.join(uploadsRoot, avatar_url.replace("/uploads/", ""));
      if (!fs.existsSync(localPath)) {
        avatar_url = "/uploads/default.jpg";
      }
    }

    const stats = await getQuery<Stats>(
      "SELECT * FROM stats WHERE user_id = ?",
      [user.user_id]);

    const matches = await getAll<Match>(
      "SELECT m.match_id, m.played_at, mp.user_id, mp.score, mp.result \
      FROM match_players mp \
      JOIN matches m ON mp.match_id = m.match_id \
      WHERE mp.user_id = ? \
      ORDER BY m.played_at DESC",
      [user.user_id]);

    const history: MatchHistoryResponse[] = [];
    for (const match of matches) {
      const opponentsRaw = await getAll<Opponent>(
      "SELECT u.display_name, mp.score, mp.result \
      FROM match_players mp \
      LEFT JOIN users u ON mp.user_id = u.user_id \
      WHERE mp.match_id = ? AND mp.user_id != ?",
      [match.match_id, user.user_id]
      );

      const opponents = opponentsRaw.map(o => ({
      display_name: o.display_name ?? null,
      score: o.score,
      result: o.result,
      }));
	  
      history.push({
      match_id: match.match_id,
      played_at: match.played_at,
      user: { score: match.score, result: match.result },
      opponents,
      });
    }

    let friendship_status: "none" | "pending_sent" | "pending_received" | "friends" = "none";
    if (currentUser && currentUser.user_id !== user.user_id) {
      const friendship = await getQuery<any>(
        `SELECT * FROM friends WHERE 
          (user_id = ? AND friend_id = ?) 
          OR (user_id = ? AND friend_id = ?)`,
        [currentUser.user_id, user.user_id, user.user_id, currentUser.user_id]
      );
      if (friendship) {
        if (friendship.friend_state === "accepted") {
          friendship_status = "friends";
        } else if (friendship.friend_state === "pending") {
          if (friendship.requester_id === currentUser.user_id) {
            friendship_status = "pending_sent";
          } else if (friendship.requester_id === user.user_id) {
            friendship_status = "pending_received";
          }
        }
      }
    }

    return reply.send({
      user: {
        user_id: user.user_id,
        display_name: user.display_name,
        avatar_url
      },
      stats: stats || {
        user_id: user.user_id,
        games_played: 0,
        games_won: 0,
        lost_games: 0
      },
      recent_matches: history,
      friendship_status
    });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
}

export const getMyProfile = async (request: FastifyRequest, reply: FastifyReply) => {
	const user = request.user as { user_id: number, display_name: string };
	try {
    const fullUser = await getQuery<User>(
        "SELECT user_id, display_name, email, twofa_enabled FROM users WHERE user_id = ?",
    	[user.user_id],
    )
    if (!fullUser) {
        return reply.status(404).send({ error: "User not found" })
    }

    return reply.send({
        message: "Authenticated user",
        user: {
          user_id: fullUser.user_id,
          display_name: fullUser.display_name,
          email: fullUser.email,
          twofa_enabled: fullUser.twofa_enabled || false,
        },
        token: request.cookies.token,
    })
    } catch (error) {
      console.error("❌ Error en endpoint /me:", error)
      return reply.status(500).send({ error: "Internal server error" })
    }
}