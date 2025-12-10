-- backend/src/db/init.sql

CREATE TABLE IF NOT EXISTS users (
	user_id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT,
	display_name TEXT NOT NULL UNIQUE,
	socket_id INTEGER,
	is_online BOOLEAN DEFAULT false,
	avatar TEXT DEFAULT NULL,
	google_id TEXT UNIQUE,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	is_verified BOOLEAN DEFAULT false,
	verification_code TEXT,
	verification_expires INTEGER,
	twofa_enabled BOOLEAN DEFAULT false,
	twofa_verified BOOLEAN DEFAULT false,
	twofa_code TEXT,
	twofa_expires_at INTEGER,
	reset_token TEXT,
	reset_token_expires INTEGER
);

CREATE TABLE IF NOT EXISTS stats (
	user_id INTEGER PRIMARY KEY,
	games_played INTEGER DEFAULT 0,
	games_won INTEGER DEFAULT 0,
	lost_games INTEGER DEFAULT 0,
	FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friends (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	friend_id INTEGER NOT NULL,
	requester_id INTEGER NOT NULL,
	friend_state TEXT CHECK(friend_state IN ('pending', 'accepted', 'blocked')),
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(user_id, friend_id),
	FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
	FOREIGN KEY(friend_id) REFERENCES users(user_id) ON DELETE CASCADE,
	FOREIGN KEY(requester_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat (
	chat_id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_one INTEGER,
	user_two INTEGER,
	users TEXT,
	generalChat BOOLEAN DEFAULT false,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	is_blocked BOOLEAN DEFAULT false,
	blocked_user TEXT DEFAULT NULL,
	FOREIGN KEY(user_one) REFERENCES users(user_id) ON DELETE CASCADE,
	FOREIGN KEY(user_two) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	chat_id INTEGER NOT NULL,
	sender_id INTEGER NOT NULL,
	receiver_id INTEGER,
	content TEXT NOT NULL,
	sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY(chat_id) REFERENCES chat(chat_id) ON DELETE CASCADE,
	FOREIGN KEY(sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
	FOREIGN KEY(receiver_id) REFERENCES users(user_id) ON DELETE CASCADE	
);

CREATE TABLE IF NOT EXISTS matches (
    match_id INTEGER PRIMARY KEY AUTOINCREMENT,
    played_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_players (
    match_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    result TEXT CHECK(result IN ('win', 'loss')),
    PRIMARY KEY (match_id, user_id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS create_stats_after_user
AFTER INSERT ON users
BEGIN
	INSERT INTO stats (user_id) VALUES (NEW.user_id);
END;

CREATE TRIGGER IF NOT EXISTS update_stats_after_match
AFTER INSERT ON match_players
BEGIN
	UPDATE stats
	SET games_played = games_played + 1,
	    games_won = games_won + (CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END),
	    lost_games = lost_games + (CASE WHEN NEW.result = 'loss' THEN 1 ELSE 0 END)
	WHERE user_id = NEW.user_id;
END;
