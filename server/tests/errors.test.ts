import express from "express";
import request from "supertest";
import { asyncHandler, errorHandler, HttpError, notFoundHandler } from "../src/errors";

describe("error middleware", () => {
  const buildApp = (register: (app: express.Express) => void) => {
    const app = express();
    app.use(express.json());
    register(app);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
  };

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("turns a rejected async handler into a 500 response instead of hanging", async () => {
    const app = buildApp((a) =>
      a.get(
        "/boom",
        asyncHandler(async () => {
          throw new Error("kaboom");
        })
      )
    );

    const res = await request(app).get("/boom");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "internal server error" });
  });

  it("does not leak internal error messages", async () => {
    const app = buildApp((a) =>
      a.get(
        "/boom",
        asyncHandler(async () => {
          throw new Error("postgres password is hunter2");
        })
      )
    );

    const res = await request(app).get("/boom");

    expect(JSON.stringify(res.body)).not.toContain("hunter2");
  });

  it("uses the status and message of an HttpError", async () => {
    const app = buildApp((a) =>
      a.get(
        "/teapot",
        asyncHandler(async () => {
          throw new HttpError(418, "i am a teapot");
        })
      )
    );

    const res = await request(app).get("/teapot");

    expect(res.status).toBe(418);
    expect(res.body).toEqual({ error: "i am a teapot" });
  });

  it("keeps the client status of a malformed JSON body", async () => {
    const app = buildApp((a) => a.post("/echo", (_req, res) => res.json({ ok: true })));

    const res = await request(app).post("/echo").type("json").send("{not json");

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it("answers unknown routes with a JSON 404", async () => {
    const app = buildApp(() => {});

    const res = await request(app).get("/nowhere");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "not found" });
  });
});
