# Node.js + MongoDB (FerretDB) — a SPARC Cloud template

A small **REST API with Node.js, Express 5 and Mongoose**. It keeps "notes" in a **MongoDB-compatible database**.
On SPARC Cloud that database is **FerretDB** (open source): the usual MongoDB drivers work, but not every MongoDB
feature does — no transactions, no change streams, no views or schema validators. See the compatibility notes in the
SPARC Cloud guide (Databases → MongoDB-compatible databases).

```
server.js          the API (routes), starts the server
db.js              the database connection, the indexes, the health ping
models.js          your Mongoose models
package.json       dependencies; package-lock.json = their exact versions
sparc.json         tells SPARC Cloud how to run this (port, health check, database)
```

| Route | What it does |
| --- | --- |
| `GET /` | name and the list of routes |
| `GET /api/notes` | the latest 100 notes |
| `POST /api/notes` `{"text": "…"}` | adds a note (1–500 characters) |
| `GET /healthz` | 200 when the database answers a ping, else 503 |

## Run it on your computer

```sh
npm ci
# a FerretDB for your computer only (FerretDB's own evaluation image; any MongoDB-compatible server works too):
docker run -d --name ferretdb -p 127.0.0.1:27017:27017 -e POSTGRES_USER=app -e POSTGRES_PASSWORD=app \
  ghcr.io/ferretdb/ferretdb-eval:2
MONGODB_URI='mongodb://app:app@localhost:27017/app?authSource=app' npm start     # http://localhost:8080
curl -X POST localhost:8080/api/notes -H 'content-type: application/json' -d '{"text":"hello"}'
```

## Deploy on SPARC Cloud

1. Dashboard → **Templates** → *Node.js + MongoDB* → **Create my copy on GitHub**: choose your account/organization
   and a repository name on GitHub. The copy is yours.
2. **I've created it** → pick the new repository (**Refresh** if needed).
3. Review: port 8080, health check `/healthz`, the setting `NODE_ENV=production`, and **a MongoDB (FerretDB)
   database** (create one or use an existing one). Creating/attaching a database needs a startup **owner**.
4. **Create** → SPARC Cloud creates the database, builds (no Dockerfile needed), deploys. The app gets
   `MONGODB_URI` (and `MONGO_URL`, the same) from the attached database.

The app runs as user 1000 (not root) and listens on `$PORT` (8080). It does not start without a database: the log
then says `DATABASE SETUP FAILED`.

## Change things

- **Add a route** in `server.js`: `app.get("/api/hello", (req, res) => res.json({ hello: "world" }));`
- **Change your data:** edit `models.js`. MongoDB needs no migrations for new fields; give them a `default` if old
  documents must have a value. Indexes declared on a schema are created at the next start (removing one from the
  code does not drop it).
- Don't use `session.withTransaction(…)`: FerretDB has no transactions.
- Settings (`Settings & secrets` tab) arrive as environment variables: `process.env.MY_SETTING`.
- **Update a dependency:** `npm install mongoose@<version>`, commit `package.json` and `package-lock.json`.

## Licence

MIT (see `LICENSE`). The copy you made is yours.
