import { FastifyReply, FastifyRequest } from "fastify";
import { getQuery, runQuery } from "../db/utils";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import path from "path";
import crypto from "crypto";

import {
  User,
} from "../types/types";

const pump = promisify(pipeline);

const UPLOADS_ROOT = process.env.UPLOADS_DIR
	? path.resolve(process.env.UPLOADS_DIR)
	: path.join(__dirname, "../uploads");

export const updateAvatar = async (request: FastifyRequest, reply: FastifyReply) => {
	const { user_id } = request.user as { user_id: number };

	try {
		const data = await request.file();
		if (!data) {
			return reply.status(400).send({ error: "No file uploaded" });
		}

		const allowedTypes = ["image/jpeg", "image/png"];
		if (!allowedTypes.includes(data.mimetype)) {
			return reply.status(400).send({ error: "Invalid file type. Only JPG or PNG allowed" });
		}

		const ext = data.mimetype === "image/png" ? ".png" : ".jpg";

		const avatarsDir = path.join(UPLOADS_ROOT, "avatars");
		if (!fs.existsSync(avatarsDir)) {
			fs.mkdirSync(avatarsDir, { recursive: true });
		}

		try {
			const user = await getQuery<User>(
				`SELECT avatar FROM users WHERE user_id = ?`,
				[user_id]
			);
			if (user && user.avatar && user.avatar.startsWith("/uploads/")) {
				const prevLocal = path.join(UPLOADS_ROOT, user.avatar.replace("/uploads/", ""));
				if (prevLocal.startsWith(avatarsDir) && fs.existsSync(prevLocal)) {
					fs.unlinkSync(prevLocal);
				}
			}
		} catch {}

		const filenameHash = crypto
			.createHash("sha256")
			.update(`${user_id}:${Date.now()}:${crypto.randomUUID()}`)
			.digest("hex")
			.slice(0, 32);
		const filename = `${filenameHash}${ext}`;
		const filepath = path.join(avatarsDir, filename);

		await pump(data.file, fs.createWriteStream(filepath));

		const avatarUrl = `/uploads/avatars/${filename}`;
		await runQuery(
			`UPDATE users SET avatar = ? WHERE user_id = ?`,
			[avatarUrl, user_id]
		);

		return reply.status(200).send({
			message: "Avatar updated successfully",
			avatarUrl,
		});
	} catch (err) {
		request.log.error(err);
		return reply.status(500).send({ error: "Internal server error" });
	}
};

export const getUserAvatar = async(request: FastifyRequest, reply: FastifyReply) => {
	const { user_id } = request.user as { user_id: number };

	try {
		const user = await getQuery<User>(
			`SELECT *
			FROM users
			WHERE user_id = ?`,
		[user_id]);

		if (!user) {
			return reply.status(400).send({ error: 'User not found '});
		}

		let avatarUrl = user.avatar || "/uploads/default.jpg";

		if (avatarUrl.startsWith("/uploads/")) {
			const localPath = path.join(UPLOADS_ROOT, avatarUrl.replace("/uploads/", ""));
			if (!fs.existsSync(localPath)) {
				avatarUrl = "/uploads/default.jpg";
			}
		}

		if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
			try {
				const avatarsDir = path.join(UPLOADS_ROOT, "avatars");
				if (!fs.existsSync(avatarsDir)) {
					fs.mkdirSync(avatarsDir, { recursive: true });
				}

				let ext = ".jpg";
				let contentType = "";
				try {
					const headRes = await fetch(avatarUrl, { method: "HEAD" });
					contentType = headRes.headers.get("content-type") || "";
				} catch {}
				if (contentType.includes("png")) ext = ".png";

				const stable = crypto.createHash("sha256").update(`google:${user.user_id}`).digest("hex").slice(0,16);
				const filename = `g_${stable}${ext}`;
				const filePath = path.join(avatarsDir, filename);

				if (!fs.existsSync(filePath)) {
					const ctrl = new AbortController();
					const timer = setTimeout(() => ctrl.abort(), 5000);
					try {
						const res = await fetch(avatarUrl, { signal: ctrl.signal });
						if (!res.ok) throw new Error(`Failed to fetch avatar: ${res.status}`);
						const ct = res.headers.get("content-type") || "";
						if (!ct.startsWith("image/")) throw new Error("Not an image");
						if (ct.includes("png")) ext = ".png";
						const ab = await res.arrayBuffer();
						fs.writeFileSync(filePath, Buffer.from(ab));
					} finally {
						clearTimeout(timer);
					}
				}

				const localUrl = `/uploads/avatars/${filename}`;
				await runQuery(
					`UPDATE users SET avatar = ? WHERE user_id = ?`,
					[localUrl, user.user_id]
				);
				avatarUrl = localUrl;
			} catch (e) {
				request.log.error(`Error downloading avatar: ${e}`);
			}
		}

		return reply.status(200).send({ avatarUrl });
	} catch (err) {
		request.log.error(err)
   		return reply.status(500).send({ error: "Internal server error" })
	}
}