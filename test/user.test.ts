import { UserMock } from "./utils/UserMock";
import { app } from "../src/application/app";
import request from "supertest";
import { logger } from "../src/application/logging";


describe("POST /api/users/register", () => {
  afterEach(async () => {
    await UserMock.delete();
  });
  it("responds with 200 created", async () => {
    const res = await request(app).post("/api/users/register").send({
      username: "test",
      fullName: "Test User",
      email: "test@example.com",
      password: "test123"
    });

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe("test");
    expect(res.body.data.fullName).toBe("Test User");
    expect(res.body.data.email).toBe("test@example.com");
  });
});

describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await UserMock.create();
  });

  afterEach(async () => {
    await UserMock.delete();
  });

  it("responds with 200 success", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "test123"
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("responds with 400 incorrect credentials", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "wrongpassword"
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });
});

describe("POST /api/users/me", () => {
  beforeEach(async () => {
    await UserMock.create();
  });

  afterEach(async () => {
    await UserMock.delete();
  });

  it("responds with 200 user data", async () => {
    const {accessToken, refreshToken} = await UserMock.login();
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe("test");
  });

  it("responds with 401 unauthorized", async () => {
    const res = await request(app).get("/api/users/me");

    expect(res.status).toBe(401);
  });
});

describe("POST /api/users/refresh-token", () => {
    beforeEach(async () => {
    await UserMock.create();
  });

  afterEach(async () => {
    await UserMock.delete();
  });

  it("responds with 200 and new access token", async () => {
    const {accessToken,refreshToken} = await UserMock.login();

    const res = await request(app)
      .get("/api/users/refresh-token")
      .set("Cookie", `refreshToken=${refreshToken}`);
    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined();
  });
});

describe("DELETE /api/users/logout", () => {
  beforeEach(async () => {
    await UserMock.create();
  });

  afterEach(async () => {
    await UserMock.delete();
  });

  it("responds with 200 successfully", async () => {
    const {accessToken} = await UserMock.login();
    const res = await request(app)
      .delete("/api/users/logout")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
  });

  it("responds with 401 unauthorized if no token", async () => {
    const res = await request(app).delete("/api/users/logout");

    expect(res.status).toBe(401);
  });
});
