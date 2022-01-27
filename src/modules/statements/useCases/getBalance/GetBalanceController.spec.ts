import request from "supertest";

import { app } from "../../../../app";

import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Get User Balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show user balances", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Lucas Matheus",
      email: "lucas@email.com",
      password: "123456",
    });

    const authenticatedUserResponse = await request(app).post("/api/v1/sessions").send({
      email: "lucas@email.com",
      password: "123456",
    });

    const token = authenticatedUserResponse.body.token;

    const gotBalanceResponse = await request(app).get("/api/v1/statements/balance").send().set("Authorization", `Bearer ${token}`);

    expect(gotBalanceResponse.body).toHaveProperty("statement");
    expect(gotBalanceResponse.body).toHaveProperty("balance");

  });

  it("Should not be able to show a balance of an unauthenticated user", async () => {
    const gotBalanceResponse = await request(app).get("/api/v1/statements/balance").send();

    expect(gotBalanceResponse.status).toBe(401);
    expect(gotBalanceResponse.body).toStrictEqual({ message: 'JWT token is missing!' });
  });
})
