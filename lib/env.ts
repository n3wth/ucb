import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
    UCB_APP_PASSWORD: z.string().min(1, "UCB_APP_PASSWORD is required"),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    GOOGLE_REDIRECT_URI: z.string().url().optional(),
    GOOGLE_REFRESH_TOKEN: z.string().min(1).optional(),
    GOOGLE_SIGNIN_REDIRECT_URI: z.string().url().optional(),
    UCB_ALLOWED_EMAIL_DOMAIN: z.string().min(1).optional(),
    UCB_FRANKLIN_FOLDER_ID: z.string().min(1).optional(),
    UCB_ANNEX_FOLDER_ID: z.string().min(1).optional(),
    UCB_CALENDAR_ID: z.string().min(1).optional(),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    SESSION_SECRET: process.env.SESSION_SECRET,
    UCB_APP_PASSWORD: process.env.UCB_APP_PASSWORD,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_SIGNIN_REDIRECT_URI: process.env.GOOGLE_SIGNIN_REDIRECT_URI,
    UCB_ALLOWED_EMAIL_DOMAIN: process.env.UCB_ALLOWED_EMAIL_DOMAIN,
    UCB_FRANKLIN_FOLDER_ID: process.env.UCB_FRANKLIN_FOLDER_ID,
    UCB_ANNEX_FOLDER_ID: process.env.UCB_ANNEX_FOLDER_ID,
    UCB_CALENDAR_ID: process.env.UCB_CALENDAR_ID,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
  emptyStringAsUndefined: true,
})
