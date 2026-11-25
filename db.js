// The database part. SPARC Cloud sets MONGODB_URI when you attach a MongoDB (FerretDB) database to the app
// (Database tab). Any MongoDB-compatible address works on your computer too.
const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

// Fail a query after 5 seconds when the database does not answer, instead of waiting for it.
mongoose.set("bufferTimeoutMS", 5000);

// Connect, then create the indexes the models declare (see models.js). Safe on every start: an index that already
// exists is left alone. A new database can need a moment to answer, so try for about a minute.
async function connect(models) {
  if (!url) throw new Error("No MONGODB_URI: attach a MongoDB (FerretDB) database to this app (Database tab).");
  for (let attempt = 1; ; attempt += 1) {
    try {
      await mongoose.connect(url, { serverSelectionTimeoutMS: 5000, maxPoolSize: 5, autoIndex: false });
      break;
    } catch (err) {
      await mongoose.disconnect().catch(() => {});
      if (attempt >= 12) throw err;
      console.log(`Database not answering yet (try ${attempt}): ${err.name}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  for (const model of models) await model.createIndexes();
  console.log("Database connected, indexes are in place.");
}

// For /healthz: asks the database itself (a ping), not only whether a connection once existed.
async function healthy() {
  await mongoose.connection.db.admin().command({ ping: 1 }, { timeoutMS: 3000 });
}

module.exports = { connect, healthy };
