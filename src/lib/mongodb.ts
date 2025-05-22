
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  console.error("Error: MONGODB_URI environment variable is not defined.");
  // For server-side code, throwing an error might be appropriate.
  // For client-side usage (if any, though unlikely for direct DB connection), handle differently.
  // Since this will be used in API routes (server-side), we can be strict.
  throw new Error("MONGODB_URI environment variable is not defined. Please check your .env file.");
}
if (!dbName) {
  console.error("Error: MONGODB_DB_NAME environment variable is not defined.");
  throw new Error("MONGODB_DB_NAME environment variable is not defined. Please check your .env file.");
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  // @ts-ignore
  if (!global._mongoClientPromise) {
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = client.connect();
}

export async function getDb() {
  const mongoClient = await clientPromise;
  return mongoClient.db(dbName);
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
