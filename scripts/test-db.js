import { verifyConnection, executeQuery } from "../db/connection.js";

async function main() {
	try {
		const ok = await verifyConnection();
		if (!ok) {
			console.error("Connessione MySQL fallita");
			process.exit(1);
		}
		console.log("Connessione MySQL riuscita");

		const rows = await executeQuery("SELECT 1 AS result");
		console.log("Query di test:", rows);
		process.exit(0);
	} catch (err) {
		console.error("Errore durante il test DB:", err?.message || err);
		process.exit(1);
	}
}

main();