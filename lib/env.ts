import { z } from 'zod'

const envSchema = z.object({
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).default('pk_test_placeholder_key'),
  CLERK_SECRET_KEY: z.string().min(1).default('sk_test_placeholder_key'),

  // Supabase (Database only)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default('placeholder_anon_key'),

  // n8n Webhook
  N8N_WEBHOOK_URL: z.string().url().default('https://placeholder.webhook.url'),
  N8N_WEBHOOK_SECRET: z.string().min(1).default('placeholder_secret'),

  // AI Services
  SERPAPI_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).default('pk_test_placeholder_key'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default('placeholder_anon_key'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
})

// Server-side environment validation
export const env = envSchema.parse(process.env)

// Client-side environment validation
export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})

export type Env = z.infer<typeof envSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>
