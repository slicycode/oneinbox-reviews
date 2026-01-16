import fs from 'node:fs'
import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env'
dotenv.config({ path: envPath })

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'postgresql',
  extensionsFilters: [
    // "postgis", // Uncomment if you need postgis
  ],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
