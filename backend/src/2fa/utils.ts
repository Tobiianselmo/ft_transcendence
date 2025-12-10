 

import { FastifyReply, FastifyRequest } from 'fastify';
import { getQuery, runQuery } from "../db/utils";
import { User } from "../types/types";
import { sendEmail } from "../utils/nodemailer";
import crypto from "crypto";

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function send2FACodeIfAllowed(user: User): Promise<{ success: boolean; message?: string }> {
	const code = generateCode();
	const expiresAt = Date.now() + 60 * 1000;

	await runQuery('UPDATE users SET twofa_code = ?, twofa_expires_at = ? WHERE user_id = ?', [code, expiresAt, user.user_id]);

	await sendEmail(user.email, "Your code 2FA", `Your code is: ${code}`);
	return { success: true };
}

export const verify2FA = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { email, code } = request.body as { email: string; code: string }

  if (!email || !code) {
    return reply.status(400).send({ error: "Missing email or 2FA code" })
  }

  try {
    const user = await getQuery<User>("SELECT * FROM users WHERE email = ?", [email])

    if (!user || !user.twofa_enabled || !user.twofa_code) {
      return reply.status(401).send({ error: "2FA not enabled or invalid user" })
    }

    if (user.twofa_code !== code) {
      return reply.status(401).send({ error: "Invalid 2FA code" })
    }

		if (Date.now() > user.twofa_expires_at) {
			return reply.status(401).send({ error: '2FA code expired' })
		}

		await runQuery('UPDATE users SET twofa_verified = true, twofa_code = NULL, twofa_expires_at = NULL WHERE user_id = ?', [user.user_id]);

    const token = await reply.jwtSign(
      { user_id: user.user_id, display_name: user.display_name },
      { expiresIn: "1h" }
    );
    const csrfToken = crypto.randomBytes(32).toString("hex");

    return reply.status(200)
    .setCookie("token", token, {
      httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 3600,
    })
    .setCookie("csrf_token", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    })
    .send({ message: "2FA verified, please proceed with login ", 
      token: token,
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: "Internal server error" })
  }
}
