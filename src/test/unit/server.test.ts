// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startServer, app } from "../../../server";
import { createServer as createViteServer } from "vite";

vi.mock("vite", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    createServer: vi.fn().mockResolvedValue({
      middlewares: (_req: unknown, _res: unknown, next: () => void) => next()
    })
  };
});

describe("Server Startup Unit Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should start the server successfully in development mode", async () => {
    process.env.NODE_ENV = "development";
    const listenMock = vi.spyOn(app, "listen").mockImplementation((_port: unknown, _host: unknown, cb?: unknown) => {
      if (typeof cb === "function") (cb as () => void)();
      return {} as import("http").Server;
    });

    await startServer();
    expect(listenMock).toHaveBeenCalled();
    expect(createViteServer).toHaveBeenCalled();
  }, 15000);

  it("should start the server successfully in production mode", async () => {
    process.env.NODE_ENV = "production";
    const listenMock = vi.spyOn(app, "listen").mockImplementation((_port: unknown, _host: unknown, cb?: unknown) => {
      if (typeof cb === "function") (cb as () => void)();
      return {} as import("http").Server;
    });

    await startServer();
    expect(listenMock).toHaveBeenCalled();
  }, 15000);
});
