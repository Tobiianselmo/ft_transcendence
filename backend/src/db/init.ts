import fs from "fs"
import path from "path"
import db from "./database"

export async function initializeDatabase() {
  const candidates = [
    path.resolve(__dirname, "../../src/db/init.sql"),  
    path.resolve(__dirname, "./init.sql"),             
  ]
  const initSqlPath = candidates.find(p => fs.existsSync(p)) || candidates[0]

  const initSql = fs.readFileSync(initSqlPath, "utf8")

  return new Promise<void>((resolve, reject) => {
    db.exec(initSql, (err) => {
      if (err) {
        console.error("Failed to initialize database:", err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}