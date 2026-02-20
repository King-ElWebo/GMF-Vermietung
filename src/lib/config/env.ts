import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL ist erforderlich"),
  NEXT_PUBLIC_BASE_URL: z.string().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:\n",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables. Check .env.local");
  }

  return parsed.data;
}

// Singleton – evaluated once at module load
export const env = loadEnv();