import express from "express";
import request from "supertest";

jest.mock("../../src/db", () => ({
  query: jest.fn(),
  pool: { query: jest.fn(), end: jest.fn() },
}));

import inventoryRoutes from "../../src/routes/inventory";
import { query } from "../../src/db";

const mockedQuery = query as jest.Mock;

const app = express();
app.use("/api/inventory", inventoryRoutes);

describe("GET /api/inventory/items", () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it("returns the rows returned by the database", async () => {
    const rows = [
      { id: 1, product_code: "A-1", title: "Bolt", spec: "M8", unit: "pcs", system_qty: "12" },
      { id: 2, product_code: "A-2", title: "Nut", spec: "M8", unit: "pcs", system_qty: "40" },
    ];
    mockedQuery.mockResolvedValueOnce({ rows });

    const res = await request(app).get("/api/inventory/items");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: rows });
  });

  it("returns an empty list when there are no items", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/inventory/items");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [] });
  });

  it("orders by product_code and caps the page size", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    await request(app).get("/api/inventory/items");

    const sql = mockedQuery.mock.calls[0][0] as string;
    expect(sql).toContain("ORDER BY product_code");
    expect(sql).toContain("LIMIT 100");
  });
});
