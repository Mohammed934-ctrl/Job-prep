import { env } from '@/data/env/server';

import { defineConfig } from 'drizzle-kit';

// // export default defineConfig({
// //   out: './src/drizzle/migrations',
// //   schema: './src/drizzle/schema.ts',
// //   dialect: 'postgresql',
// //   dbCredentials: {
// //     url: env.DATABASE_URL
// //   },
// })


export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
