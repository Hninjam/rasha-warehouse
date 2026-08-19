import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.mock("../../src/db", () => ({
  query: jest.fn(),
  pool: { query: jest.fn(), end: jest.fn() },
}));

import inventoryRoutes from "../../src/routes/inventory";
import { query } from "../../src/db";

const mockedQuery = query as jest.Mock;

const TEST_SECRET = "test_secret_that_is_at_least_32_chars_long";

const app = express();
app.use("/api/inventory", inventoryRoutes);

const token = () =>
  jwt.sign({ userId: 7, personnel_code: "302237", role: "admin" }, TEST_SECRET, { expiresIn: "8h" });

describe("GET /api/inventory/items", () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    process.env.JWT_SECRET = TEST_SECRET;
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/inventory/items");

    expect(res.status).toBe(401);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("rejects requests with an invalid token", async () => {
    const res = await request(app)
      .get("/api/inventory/items")
      .set("Authorization", "Bearer not-a-real-token");

    expect(res.status).toBe(401);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("returns the rows returned by the database", async () => {
    const rows = [
      { id: 1, product_code: "A-1", title: "Bolt", spec: "M8", unit: "pcs", system_qty: "12" },
      { id: 2, product_code: "A-2", title: "Nut", spec: "M8", unit: "pcs", system_qty: "40" },
    ];
    mockedQuery.mockResolvedValueOnce({ rows });

    const res = await request(app)
      .get("/api/inventory/items")
      .set("Authorization", `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: rows });
  });

  it("returns an empty list when there are no items", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/inventory/items")
      .set("Authorization", `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [] });
  });

  it("orders by product_code and caps the page size", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    await request(app).get("/api/inventory/items").set("Authorization", `Bearer ${token()}`);

    const sql = mockedQuery.mock.calls[0][0] as string;
    expect(sql).toContain("ORDER BY product_code");
    expect(sql).toContain("LIMIT 100");
  });
});
