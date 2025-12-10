 

import { FastifyReply, FastifyRequest } from "fastify";
import { isStrongerPassword, isValidDisplayName, isValidEmail } from "../utils/validators";
import bcrypt from "bcrypt";
import { runQuery, getQuery, getAll } from "../db/utils";
import crypto from "crypto";
import { sendEmail } from "../utils/nodemailer";
import xss from "xss";
import { generateCode, send2FACodeIfAllowed } from "../2fa/utils";
import { OAuth2Client } from "google-auth-library";
import { getDisplayName } from "../utils/google";

import {
  User,
  LoginRequestBody,
  RegisterRequestBody,
  VerifyRegisterBody,
} from "../types/types";

export const logoutUser = async (request: FastifyRequest, reply: FastifyReply) => {
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

  reply
    .clearCookie("token", cookieOptions)
    .clearCookie("csrf_token", csrfCookieOptions)
    .clearCookie("session_id", cookieOptions)
    .clearCookie("token")
    .clearCookie("csrf_token")
    .clearCookie("session_id");

  return reply.status(200).send({
    message: "Logout successful",
    debug: {
      had_token: !!request.cookies.token,
      had_csrf: !!request.cookies.csrf_token,
      had_session: !!request.cookies.session_id,
      cookies_before: Object.keys(request.cookies),
    },
  });
};

export const loginUser = async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.status(400).send({ error: "Missing required fields" });
  }

  try {
    const user = await getQuery<User>("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return reply.status(401).send({ error: "Invalid email" });
    }

    if (!user.is_verified) {
      return reply.status(401).send({
        message: "User not verified",
        redirect: "/verify-register",
        email: user.email,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return reply.status(401).send({ error: "Invalid password" });
    }

    if (user.twofa_enabled && !user.twofa_verified) {
      const result = await send2FACodeIfAllowed(user);
      if (!result.success) {
        return reply.status(429).send({ error: result.message });
      }

      return reply.status(200).send({
        message: "2FA code sent to your email",
        twofa_required: true,
      });
    }

    if (user.twofa_enabled) {
      await runQuery("UPDATE users SET twofa_verified = false WHERE user_id = ?", [user.user_id])
    }

    const token = await reply.jwtSign(
      { user_id: user.user_id, display_name: user.display_name },
      { expiresIn: "1h" }
    );
    const csrfToken = crypto.randomBytes(32).toString("hex");

    return reply
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
      .send({
        message: "Login successful",
        token: token,
        debug: {
          token_set: true,
          csrf_set: true,
          user_id: user.user_id,
        },
      });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

export const registerUser = async (request: FastifyRequest<{ Body: RegisterRequestBody }>, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { email, password, display_name } = request.body;

  if (!email || !password || !display_name) {
    return reply.status(400).send({ error: "Missing required fields" });
  }

  if (!isValidEmail(email)) {
    return reply.status(400).send({ error: "Invalid email format" });
  }

  if (!isStrongerPassword(password)) {
    return reply.status(400).send({
      error: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number",
    });
  }

  if (!isValidDisplayName(display_name)) {
    return reply.status(400).send({
      error: "Display name must contain only letters, numbers or underscores, and be at least 3 characters long",
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const safeDisplayName = xss(display_name);

    const userId = await runQuery(
      "INSERT INTO users (email, password_hash, display_name, is_verified) VALUES (?, ?, ?, 0)",
      [email, hash, safeDisplayName]
    );

    const verificationCode = generateCode();
    const expiresAt = Date.now() + 1 * 60 * 1000;

    await runQuery(
      "UPDATE users SET verification_code = ?, verification_expires = ? WHERE user_id = ?",
      [verificationCode, expiresAt, userId]
    );

    await sendEmail(email, "Your verification code", `Your code is: ${verificationCode}`);

    return reply.status(201).send({
      message: "User registered, verification code sent",
      redirect: "/verify-register",
      email: email,
    });
  } catch (err: any) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return reply.status(400).send({ message: "Email o display_name already exists" });
    }
    request.log.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

export const verifyRegister = async (request: FastifyRequest<{ Body: VerifyRegisterBody }>, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { email, code } = request.body;

  if (!email || !code) {
    return reply.status(400).send({ error: "Missing required fields" });
  }

  try {
    const user = await getQuery<User>("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return reply.status(401).send({ error: "Invalid email" });  
    }

    if (user.verification_code !== code) {
      return reply.status(401).send({ error: "Invalid verification code" });
    }

    if (Date.now() > user.verification_expires) {
      return reply.status(401).send({ error: "Verification code has expired" })
    }

    await runQuery(
      "UPDATE users SET is_verified = true, twofa_code = NULL, verification_expires = NULL WHERE user_id = ?",
      [user.user_id]
    );

    return reply.status(200).send({ message: "User verified" });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

export const googleOAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const forwardedProto = (request.headers["x-forwarded-proto"] as string) || request.protocol || "http";
    const host = (request.headers["host"] as string) || "localhost";
    const externalOrigin = `${forwardedProto}: 
    const apiBase = `${externalOrigin}/api`;
    const frontendBase = externalOrigin;

    const { code } = request.query as { code?: string };
    if (!code) {
      return reply.status(400).send({ error: "Missing authorization code" });
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${apiBase}/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const { id_token } = await tokenRes.json();
    if (!id_token) {
      return reply.status(400).send({ error: "No id_token received" });
    }

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return reply.status(401).send({ error: "Invalid token" });
    }

    const { sub: google_id, email, name, picture, email_verified } = payload;
    if (!email || !email_verified) {
      return reply.status(400).send({ error: "Google account email not verified" });
    }


    let user = await getQuery<User>("SELECT * FROM users WHERE email = ?", [email]);
    if (user && !user.google_id) {
      return reply.redirect(`${frontendBase}/login?msg=google_email_exists`);
    }

    if (!user) {
      const display_name = await getDisplayName(name!);
      const user_id = await runQuery(
        "INSERT INTO users (email, display_name, avatar, is_verified, google_id) VALUES (?, ?, ?, ?, ?)",
        [email, display_name, picture, 0, google_id]
      );
      
      const verificationCode = generateCode();
      const expiresAt = Date.now() + 1 * 60 * 1000;

      await runQuery(
        "UPDATE users SET verification_code = ?, verification_expires = ? WHERE user_id = ?",
        [verificationCode, expiresAt, user_id]);
      user = await getQuery<User>("SELECT * FROM users WHERE user_id = ?", [user_id]);

      await sendEmail(email, "Verify your account", `Your verification code is: ${verificationCode}`);

      return reply.redirect(`${frontendBase}/verify-register?email=${encodeURIComponent(email)}`);
    }
    
    if (user.twofa_enabled) {
      const twoFACode = generateCode();
      const expiresAt = Date.now() + 5 * 60 * 1000;

      await runQuery(
        "UPDATE users SET twofa_code = ?, twofa_expires_at = ? WHERE user_id = ?",
        [twoFACode, expiresAt, user.user_id]);

      await sendEmail(email, "Your 2FA code", `Your code is: ${twoFACode}`);
      const frontendUrl = `${frontendBase}/auth/google/callback?twofa=1&email=${encodeURIComponent(
        user.email,
      )}`;

      return reply.redirect(frontendUrl);
    }

    const token = await reply.jwtSign(
      { user_id: user.user_id, display_name: user.display_name },
      { expiresIn: "1h" }
    );
    const csrfToken = crypto.randomBytes(32).toString("hex");

    reply
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

    return reply.redirect(`${frontendBase}/auth/google/callback`);
  } catch (err) {
    console.error("Error in Google OAuth callback:", err);
    return reply.status(500).send({ error: "Internal server error" });
  }

};

export const forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { email } = request.body as { email: string };

  if (!email) {
    return reply.status(400).send({ error: "Email is required" });
  }

  try {
    const user = await getQuery<User>("SELECT * FROM users WHERE email = ?", [email]);
    if (user) {
      const resetCode = generateCode();
      const expiresAt = Date.now() + 15 * 60 * 1000;

      await runQuery(
        "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
        [resetCode, expiresAt, email]);
        
      await sendEmail(email, "Your reset password code",
        `Use this code to reset your password: ${resetCode}\n\nThis code expires in 15 minutes.`);
    }

    return reply.status(200).send({ message: "If the email is registered, you will receive a reset code shortly." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

export const resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { token, password } = request.body as { token: string, password: string };
  
  if (!token || !password) {
    return reply.status(400).send({ error: "Token and new password are required" });
  }

  try {
    const user = await getQuery<User>("SELECT * FROM users WHERE reset_token = ?", [token]);

    if (!user) {
      return reply.status(401).send({ error: "Invalid token" });
    }

    if (Date.now() > user.reset_token_expires) {
      return reply.status(401).send({ error: 'Reset token expired' })
    }

    if (!isStrongerPassword(password)) {
      return reply.status(400).send({
        error: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number",
      });
    }

    const newHash = await bcrypt.hash(password, 10);
    await runQuery(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?",
      [newHash, user.user_id]);

    return reply.status(200).send({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    return reply.status(500).send({ error: "Internal server error" })
  }
};

export const resend2FACode = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { email } = request.body as { email: string };

  if (!email) {
    return reply.status(400).send({ error: "Email is required" });
  }

  try {
    const user = await getQuery<User>("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const ret = await send2FACodeIfAllowed(user);

    if (!ret.success) {
      return reply.status(429).send({ error: ret.message });
    }

    return reply.status(200).send({ message: "2FA code resent successfully" });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

export const resendVerificationCode = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.body) {
    return reply.status(400).send({ error: "Missing body" });
  }
  
  const { email } = request.body as { email: string };

  if (!email) {
    return reply.status(400).send({ error: "Email is required" });
  }

  try {
    const user = await getQuery<User>("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    if (user.is_verified == true) {
      return reply.status(400).send({ error: "User already verified" });
    }

    const newCode = generateCode();
    const expiresAt = Date.now() + 1 * 60 * 1000;

    await runQuery(
      "UPDATE users SET verification_code = ?, verification_expires = ? WHERE email = ?",
      [newCode, expiresAt, user.email]
    );

    await sendEmail(user.email, "Your verification code", `Your code is: ${newCode}`);

    return reply.status(200).send({ message: "Verification code resent successfully" });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

export const searchUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  const { query } = request.query as { query: string };
  const currentUserId = request.user?.user_id ?? null;

  if (currentUserId == null) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  if (!query || query.trim().length < 2) {
    return reply.status(400).send({ error: "Query must be at least 2 characters" });
  }

  try {
    const userList = await getAll<{
      user_id: number;
      display_name: string
    }>(
      `SELECT display_name, user_id
      FROM users
      WHERE display_name LIKE ? COLLATE NOCASE
      AND user_id != ?
      LIMIT 5`,
      [`%${query}%`, currentUserId]);

    return reply.status(200).send(userList);
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
}

export const googleStart = async (request: FastifyRequest, reply: FastifyReply) => {
  const forwardedProto = (request.headers["x-forwarded-proto"] as string) || request.protocol || "http";
  const host = (request.headers["host"] as string) || "localhost";
  const externalOrigin = `${forwardedProto}: 
  const apiBase = `${externalOrigin}/api`;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${apiBase}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
  });
  const url = `https: 
  return reply.redirect(url);
}