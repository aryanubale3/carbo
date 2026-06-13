// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startServer, app } from "../../../server";
import { createServer as createViteServer } from "vite";

vi.mock("vite", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    createServer: vi.fn().mockResolvedValue({
      middlewares: (req: any, res: any, next: any) => next()
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
    const listenMock = (vi.spyOn(app, "listen") as any).mockImplementation((port: any, host: any, cb: any) => {
      if (cb) cb();
      return {} as any;
    });

    await startServer();
    expect(listenMock).toHaveBeenCalled();
    expect(createViteServer).toHaveBeenCalled();
  });

  it("should start the server successfully in production mode", async () => {
    process.env.NODE_ENV = "production";
    const listenMock = (vi.spyOn(app, "listen") as any).mockImplementation((port: any, host: any, cb: any) => {
      if (cb) cb();
      return {} as any;
    });

    await startServer();
    expect(listenMock).toHaveBeenCalled();
  });
});
