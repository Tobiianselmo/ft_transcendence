 

import { runQuery } from "../db/utils";

export const cleanExpiredUnverifiedUsers = async () => {
	try {
		const now = Date.now();
		const sql = 'DELETE FROM users WHERE is_verified = 0 AND verification_expires IS NOT NULL AND verification_expires < ?';
		await runQuery(sql, [now]);
	} catch {}
};