import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load env variables before using them

const url = process.env.MONGO_URI;
console.log("MongoDB URI:", url); // Debugging — check if URL is loaded

let client;

export const connectToMongoDB = async () => {
    if (!url) {
        console.error("❌ MONGO_URI is not defined. Please check your .env file.");
        process.exit(1);
    }

    try {
        client = await MongoClient.connect(url);

        console.log("✅ MongoDB is connected");

        const db = client.db();
        await createCounter(db);
        await createIndexes(db);
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err);
    }
};

export const getClient = () => client;

export const getDB = () => client.db();

const createCounter = async (db) => {
    const existingCounter = await db.collection("counters").findOne({ _id: "cartItemId" });
    if (!existingCounter) {
        await db.collection("counters").insertOne({ _id: "cartItemId", value: 0 });
        console.log("🆕 Counter initialized");
    }
};

const createIndexes = async (db) => {
    try {
        await db.collection("products").createIndex({ price: 1 });
        await db.collection("products").createIndex({ name: 1, category: -1 });
        await db.collection("products").createIndex({ desc: "text" });
        console.log("✅ Indexes created");
    } catch (err) {
        console.error("❌ Index creation failed:", err);
    }
};
