# MySQL Connection Module

This project now includes a minimal MySQL connection module built on `mysql2/promise` with a pooled connection, helper `query`, and a `transaction` utility.

## Install

The dependency is already added in `package.json`. If needed, install:

```bash
npm i
```

## Configuration

Set environment variables as needed:

- `MYSQL_HOST` (default: `127.0.0.1`)
- `MYSQL_PORT` (default: `3306`)
- `MYSQL_USER` (default: `root`) 
- `MYSQL_PASSWORD` (default: empty)
- `MYSQL_DATABASE` (default: empty; optional)
- `MYSQL_CONN_LIMIT` (default: `10`)
- `MYSQL_QUEUE_LIMIT` (default: `0`)
- `MYSQL_WAIT_FOR_CONNECTIONS` (default: `true`)
- `MYSQL_ENABLE_SSL` (default: `false`)

Example `.env`:

```bash
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_DATABASE=mydb
```

## Usage

Example `index.js` usage:

```js
import { query, transaction, closePool } from './db/mysql.js';

async function main() {
  const users = await query('SELECT 1 AS v');
  console.log(users);

  await transaction(async (conn) => {
    const [rows] = await conn.query('SELECT NOW() AS now');
    console.log(rows);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
```

The pool also closes automatically on `SIGINT` and `SIGTERM`.