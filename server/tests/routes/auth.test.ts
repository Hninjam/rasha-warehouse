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

const mockedQuery = query as jest.Mock;

const TEST_SECRET = "test_secret_that_is_at_least_32_chars_long";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

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
    process.env.JWT_SECRET = TEST_SECRET;
  });

  it("rejects a request without a personnel_code", async () => {
    const res = await request(app).post("/api/auth/login").send({ password: "1985" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "missing or invalid fields" });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("rejects a request without a password", async () => {
    const res = await request(app).post("/api/auth/login").send({ personnel_code: "302237" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "missing or invalid fields" });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("rejects non-string credential values", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ personnel_code: { $ne: 1 }, password: "1985" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "missing or invalid fields" });
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

    const payload = jwt.verify(res.body.token, TEST_SECRET) as jwt.JwtPayload;
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

  it("refuses to sign tokens when JWT_SECRET is unset", async () => {
    delete process.env.JWT_SECRET;
    mockedQuery.mockResolvedValueOnce({ rows: [dbUser] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ personnel_code: "302237", password: "1985" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "internal server error" });
  });

  it("refuses to sign tokens when JWT_SECRET is a known default", async () => {
    process.env.JWT_SECRET = "change_me";
    mockedQuery.mockResolvedValueOnce({ rows: [dbUser] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ personnel_code: "302237", password: "1985" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "internal server error" });
  });
});
