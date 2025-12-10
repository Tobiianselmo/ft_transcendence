import sqlite3 from "sqlite3"
import path from "path"
import fs from "fs"

const dbPath = path.resolve(__dirname, "..", "..", "data", "transcendence.db")
const dataDir = path.dirname(dbPath)

if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true })
}

const db = new sqlite3.Database(dbPath)

export default db