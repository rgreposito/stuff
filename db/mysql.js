// Minimal ESM MySQL connection module using mysql2/promise
// Exposes: pool, query, transaction, getConnection, closePool

import mysql from 'mysql2/promise';

const {
	MYSQL_HOST = '127.0.0.1',
	MYSQL_PORT = '3306',
	MYSQL_USER = 'root',
	MYSQL_PASSWORD = '',
	MYSQL_DATABASE = '',
	MYSQL_CONN_LIMIT = '10',
	MYSQL_QUEUE_LIMIT = '0',
	MYSQL_WAIT_FOR_CONNECTIONS = 'true',
	MYSQL_ENABLE_SSL = 'false',
} = process.env;

/**
 * Lazily-created singleton pool
 */
let poolInstance;

function createPool() {
	const enableSsl = String(MYSQL_ENABLE_SSL).toLowerCase() === 'true';
	const pool = mysql.createPool({
		host: MYSQL_HOST,
		port: Number(MYSQL_PORT),
		user: MYSQL_USER,
		password: MYSQL_PASSWORD,
		database: MYSQL_DATABASE || undefined,
		connectionLimit: Number(MYSQL_CONN_LIMIT),
		queueLimit: Number(MYSQL_QUEUE_LIMIT),
		waitForConnections: String(MYSQL_WAIT_FOR_CONNECTIONS).toLowerCase() !== 'false',
		ssl: enableSsl ? { rejectUnauthorized: true } : undefined,
	});

	return pool;
}

export function getPool() {
	if (!poolInstance) {
		poolInstance = createPool();
	}
	return poolInstance;
}

export async function query(sql, params = []) {
	const [rows] = await getPool().execute(sql, params);
	return rows;
}

export async function getConnection() {
	return getPool().getConnection();
}

/**
 * Executes a function within a transaction.
 * The callback receives a dedicated connection and should use conn.query/execute.
 */
export async function transaction(callback) {
	const conn = await getConnection();
	try {
		await conn.beginTransaction();
		const result = await callback(conn);
		await conn.commit();
		return result;
	} catch (error) {
		try { await conn.rollback(); } catch {}
		throw error;
	} finally {
		conn.release();
	}
}

export async function closePool() {
	if (poolInstance) {
		const pool = poolInstance;
		poolInstance = undefined;
		await pool.end();
	}
}

// Optional: graceful shutdown hooks when this module is imported
function installGracefulShutdown() {
	const signals = ['SIGINT', 'SIGTERM'];
	signals.forEach((signal) => {
		process.once(signal, async () => {
			try {
				await closePool();
			} finally {
				process.exit(0);
			}
		});
	});
}

installGracefulShutdown();

export default {
	getPool,
	query,
	transaction,
	getConnection,
	closePool,
};

