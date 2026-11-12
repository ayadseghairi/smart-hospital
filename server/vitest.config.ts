// server/vitest.config.ts
// Explicit vitest config so the test runner stays within server/ and never
// crawls up to the root postcss.config.js (which requires tailwindcss, a
// frontend-only dependency).
import { defineConfig } from "vitest/config"

export default defineConfig({
  // Prevent Vite from loading the parent directory's postcss.config.js
  // (which requires tailwindcss — a frontend-only dependency).
  css: { postcss: {} },

  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // No CSS processing needed — this is a pure Node/TypeScript server.
    css: false,
    // Run tests sequentially to avoid Prisma connection pool contention
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    // Load test env vars
    env: {
      NODE_ENV: "test",
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://test:test@localhost:5433/delin_test",
      JWT_ACCESS_SECRET: "test-access-secret-at-least-32-chars-long",
      JWT_REFRESH_SECRET: "test-refresh-secret-at-least-32-chars-long",
      APP_BASE_URL: "http://localhost:3000",
      API_BASE_URL: "http://localhost:4000",
      CORS_ORIGIN: "http://localhost:3000",
      MAIL_ENABLED: "false",
    },
  },
})
