import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

let pool = null;

export function getMySqlPool() {
	if (pool) return pool;
	const {
		DB_HOST = "localhost",
		DB_PORT = "3306",
		DB_USER = "root",
		DB_PASSWORD = "",
		DB_NAME = "",
	} = process.env;

	pool = mysql.createPool({
		host: DB_HOST,
		port: Number(DB_PORT),
		user: DB_USER,
		password: DB_PASSWORD,
		database: DB_NAME,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
	});
	return pool;
}

export async function executeQuery(sql, params = []) {
	const poolRef = getMySqlPool();
	const [rows] = await poolRef.execute(sql, params);
	return rows;
}

export async function verifyConnection() {
	const poolRef = getMySqlPool();
	const connection = await poolRef.getConnection();
	try {
		await connection.ping();
		return true;
	} finally {
		connection.release();
	}
}