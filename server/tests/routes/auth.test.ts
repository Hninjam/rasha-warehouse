import express from "express";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("../../src/db", () => ({
  query: jest.fn(),
  pool: { query: jest.fn(), end: jest.fn() },
}));

import authRoutes from "../../src/routes/auth";
import { query } from "../../src/db";
import { errorHandler } from "../../src/errors";

const mockedQuery = query as jest.Mock;

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

const dbUser = {
  id: 7,
  personnel_code: "302237",
  password_hash: bcrypt.hashSync("1985", 4),
  full_name: "Admin User",
  role: "admin",
};

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    process.env.JWT_SECRET = "test_secret";
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("rejects a request without a personnel_code", async () => {
    const res = await request(app).post("/api/auth/login").send({ password: "1985" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "missing fields" });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("rejects a request without a password", async () => {
    const res = await request(app).post("/api/auth/login").send({ personnel_code: "302237" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "missing fields" });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("rejects an unknown personnel_code", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ personnel_code: "000000", password: "1985" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "invalid credentials" });
    expect(mockedQuery).toHaveBeenCalledWith(expect.stringContaining("FROM users"), ["000000"]);
  });

  it("rejects a wrong password", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [dbUser] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ personnel_code: "302237", password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "invalid credentials" });
  });

  it("returns a signed token and the public user fields on success", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [dbUser] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ personnel_code: "302237", password: "1985" });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({
      id: 7,
      personnel_code: "302237",
      full_name: "Admin User",
      role: "admin",
    });

    const payload = jwt.verify(res.body.token, "test_secret") as jwt.JwtPayload;
    expect(payload).toMatchObject({ userId: 7, personnel_code: "302237", role: "admin" });
    expect(payload.exp! - payload.iat!).toBe(8 * 60 * 60);
  });

  it("never leaks the password hash", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [dbUser] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ personnel_code: "302237", password: "1985" });

    expect(JSON.stringify(res.body)).not.toContain(dbUser.password_hash);
  });

  it("fails instead of signing with a default secret when JWT_SECRET is unset", async () => {
    delete process.env.JWT_SECRET;
    mockedQuery.mockResolvedValueOnce({ rows: [dbUser] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ personnel_code: "302237", password: "1985" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "internal server error" });
  });

  it("reports an unexpected database failure as a 500", async () => {
    mockedQuery.mockRejectedValueOnce(new Error("connection refused"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ personnel_code: "302237", password: "1985" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "internal server error" });
  });
});
