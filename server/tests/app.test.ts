import request from "supertest";

jest.mock("../src/db", () => ({
  query: jest.fn(),
  pool: { query: jest.fn(), end: jest.fn() },
}));

import { createApp } from "../src/app";
import { query } from "../src/db";

const mockedQuery = query as jest.Mock;
const app = createApp();

describe("GET /api/health", () => {
  it("reports ok with an ISO timestamp", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(new Date(res.body.time).toISOString()).toBe(res.body.time);
  });
});

describe("fallback handler", () => {
  it("returns 404 for unknown paths", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "not found" });
  });

  it("returns 404 for unknown methods on known paths", async () => {
    const res = await request(app).delete("/api/health");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "not found" });
  });
});

describe("mounted routers", () => {
  it("exposes the inventory router under /api/inventory", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/inventory/items");

    expect(res.status).toBe(200);
  });

  it("exposes the auth router under /api/auth", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
  });
});
