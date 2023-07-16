import { open } from "sqlite";
import sqlite3 from "sqlite3";

const db = open({
  filename: 'db/database.db',
  driver: sqlite3.Database
})

export default db