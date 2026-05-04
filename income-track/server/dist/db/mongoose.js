import mongoose from "mongoose";
import { env } from "../config/env.js";
let connected = false;
export async function connectDb() {
    if (connected)
        return;
    await mongoose.connect(env.mongodbUri);
    connected = true;
}
