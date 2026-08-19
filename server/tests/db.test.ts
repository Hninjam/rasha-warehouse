describe("db", () => {
  let poolQuery: jest.Mock;
  let PoolMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    poolQuery = jest.fn();
    PoolMock = jest.fn(() => ({ query: poolQuery }));
    jest.doMock("pg", () => ({ Pool: PoolMock }));
    process.env.DATABASE_URL = "postgres://user:pass@db:5432/other_db";
  });

  const loadDb = () => require("../src/db") as typeof import("../src/db");

  it("builds the pool from DATABASE_URL", () => {
    process.env.DATABASE_URL = "postgres://user:pass@db:5432/other_db";

    loadDb();

    expect(PoolMock).toHaveBeenCalledWith({
      connectionString: "postgres://user:pass@db:5432/other_db",
    });
  });

  it("throws when DATABASE_URL is not set", () => {
    delete process.env.DATABASE_URL;

    expect(() => loadDb()).toThrow("DATABASE_URL must be set");
  });

  it("forwards text and params to the pool and returns its result", async () => {
    const result = { rows: [{ id: 1 }] };
    poolQuery.mockResolvedValueOnce(result);

    await expect(loadDb().query("SELECT 1 FROM users WHERE id = $1", [1])).resolves.toBe(result);
    expect(poolQuery).toHaveBeenCalledWith("SELECT 1 FROM users WHERE id = $1", [1]);
  });

  it("omits params when they are not provided", async () => {
    poolQuery.mockResolvedValueOnce({ rows: [] });

    await loadDb().query("SELECT 1");

    expect(poolQuery).toHaveBeenCalledWith("SELECT 1", undefined);
  });

  it("propagates pool errors", async () => {
    poolQuery.mockRejectedValueOnce(new Error("connection refused"));

    await expect(loadDb().query("SELECT 1")).rejects.toThrow("connection refused");
  });
});
