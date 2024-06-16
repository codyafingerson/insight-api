import mongoose from "mongoose";

/**
 * Database class to handle MongoDB connection.
 */
export default class Database {
    private uri: string;

    /**
     * Creates an instance of the Database class.
     * @param {string} uri - The MongoDB connection URI.
     */
    constructor(uri: string) {
        this.uri = uri;
    }

    /**
     * Connects to the MongoDB database.
     * Logs a message on successful connection or an error message on failure.
     */
    public connect(): void {
        mongoose.connect(this.uri, {})
            .then(() => { console.log("Database connected") }).catch((error) => { console.error("Database connection error:", error) });
    }
}