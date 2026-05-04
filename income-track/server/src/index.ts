import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./db/mongoose.js";

async function bootstrap() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Server bootstrap failed:", error);
  process.exit(1);
});
