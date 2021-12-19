import request from "supertest";

import { app } from "../../../../app";

import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Create statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to deposit", async () => {
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

    const createStatementResponse = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "Deposit",
    }).set("Authorization", `Bearer ${token}`);

    console.log(createStatementResponse.body);

    expect(createStatementResponse.status).toBe(201);
    expect(createStatementResponse.body).toHaveProperty("id");
    expect(createStatementResponse.body).toHaveProperty("amount");
    expect(createStatementResponse.body).toHaveProperty("type");


  });

  it("Should be able to withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Letícia Samara",
      email: "leticia@email.com",
      password: "654321",
    });

    const authenticatedUserResponse = await request(app).post("/api/v1/sessions").send({
      email: "leticia@email.com",
      password: "654321",
    });

    const token = authenticatedUserResponse.body.token;

    await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "Deposit",
    }).set("Authorization", `Bearer ${token}`);

    const createStatementResponse = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 100,
      description: "Withdraw",
    }).set("Authorization", `Bearer ${token}`);

    expect(createStatementResponse.status).toBe(201);
    expect(createStatementResponse.body).toHaveProperty("id");
    expect(createStatementResponse.body).toHaveProperty("amount");
    expect(createStatementResponse.body).toHaveProperty("type");
  });

  it("Should not be able to create a statement of a unauthenticated user", async () => {
    const createStatementResponse = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "Deposit",
    })

    expect(createStatementResponse.status).toBe(401);
    expect(createStatementResponse.body).toStrictEqual({ message: 'JWT token is missing!' });
  });

  it("Should not be able to withdraw with insufficient funds", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Marcos André",
      email: "marcos@email.com",
      password: "654321",
    });

    const authenticatedUserResponse = await request(app).post("/api/v1/sessions").send({
      email: "marcos@email.com",
      password: "654321",
    });

    const token = authenticatedUserResponse.body.token;

    const createStatementResponse = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 100,
      description: "Deposit",
    }).set("Authorization", `Bearer ${token}`);

    expect(createStatementResponse.status).toBe(400);
    expect(createStatementResponse.body).toStrictEqual({ message: 'Insufficient funds' });
  });
})
