import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
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
