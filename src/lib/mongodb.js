import { MongoClient } from "mongodb";

/**
 * MongoDB Native Driver Singleton Connection
 * 
 * In development, Next.js hot-reloads modules, which can create
 * multiple MongoClient instances and exhaust connection pool limits.
 * We cache the connection promise on the global object to maintain
 * a single shared connection across hot reloads.
 */

if (!process.env.MONGODB_URI) {
  console.warn("[Warning]: MONGODB_URI environment variable is not defined in .env.local");
}

const uri = process.env.MONGODB_URI || "";
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the client is preserved across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, avoid global variables
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Reusable helper to get the database instance
 * 
 * @param {string} [dbName] Optional database name; defaults to the database in MONGODB_URI
 * @returns {Promise<import('mongodb').Db>} MongoDB Database instance
 */
export async function getDatabase(dbName = "community-event-volunteer") {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
