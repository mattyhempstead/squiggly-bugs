import dotenv from "dotenv";
import { join } from "path";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, "../.env") });

const envSchema = z.object({
  OPENAI_API_KEY: z.string(),
});

export const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});
