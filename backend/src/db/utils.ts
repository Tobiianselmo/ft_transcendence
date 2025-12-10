 

import db from './database';

export function runQuery(sql: string, params: any[]): Promise<number> {
	return new Promise((resolve, reject) => {
		db.run(sql, params, function (err) {
			if (err) reject (err);
			else resolve(this.lastID || this.changes);
		});
	});
}

export const getQuery = <T = any>(sql: string, params: any[] = []): Promise<T> => {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) reject (err);
			else resolve (row as T);
		});
	});
};

export const getAll = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) reject(err);
			else resolve((rows || []) as T[]);
		})
	});
};

export const getAllResults = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) reject(err);
			else resolve(rows as T[]);
		});
	});
};

 