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

  it("Should be able to transfer", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Eike Fabrício",
      email: "eike@email.com",
      password: "654321",
    });

    await request(app).post("/api/v1/users").send({
      id: "28158499-4d7b-49a0-bf1b-71266cd28188",
      name: "Filipe Zaidan",
      email: "zaidan@email.com",
      password: "654321",
    });


    const id = "28158499-4d7b-49a0-bf1b-71266cd28188"

    const authenticatedUserResponse = await request(app).post("/api/v1/sessions").send({
      email: "eike@email.com",
      password: "654321",
    });

    const token = authenticatedUserResponse.body.token;

    await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "Deposit",
    }).set("Authorization", `Bearer ${token}`);

    const createStatementResponse = await request(app).post(`/api/v1/statements/transfer/${id}`).send({
      amount: 100,
      description: "transfer",
    }).set("Authorization", `Bearer ${token}`);

    expect(createStatementResponse.status).toBe(201);
    expect(createStatementResponse.body).toHaveProperty("id");
    expect(createStatementResponse.body).toHaveProperty("amount");
    expect(createStatementResponse.body).toHaveProperty("type");
    expect(createStatementResponse.body).toHaveProperty("sender_id");
    expect(createStatementResponse.body.type).toBe("transfer");
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
      description: "Withdraw",
    }).set("Authorization", `Bearer ${token}`);

    expect(createStatementResponse.status).toBe(400);
    expect(createStatementResponse.body).toStrictEqual({ message: 'Insufficient funds' });
  });

  it("Should not be able to transfer with insufficient funds", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Little Duck",
      email: "patinha@email.com",
      password: "654321",
    });

    await request(app).post("/api/v1/users").send({
      id: "881502ef-4d99-48b9-b3cd-340712c53174",
      name: "Lótus Prisma",
      email: "lotus@email.com",
      password: "654321",
    });


    const id = "881502ef-4d99-48b9-b3cd-340712c53174"

    const authenticatedUserResponse = await request(app).post("/api/v1/sessions").send({
      email: "patinha@email.com",
      password: "654321",
    });

    const token = authenticatedUserResponse.body.token;

    const createStatementResponse = await request(app).post(`/api/v1/statements/transfer/${id}`).send({
      amount: 101,
      description: "transfer",
    }).set("Authorization", `Bearer ${token}`);

    expect(createStatementResponse.status).toBe(400);
    expect(createStatementResponse.body).toStrictEqual({ message: 'Insufficient funds' });
  });

  it("Should not be able to transfer to yourself", async () => {
    await request(app).post("/api/v1/users").send({
      id: "aaed29f5-b8d6-4418-a4f5-b97169cb7946",
      name: "Karyn Stella",
      email: "stella@email.com",
      password: "654321",
    });

    const id = "aaed29f5-b8d6-4418-a4f5-b97169cb7946"

    const authenticatedUserResponse = await request(app).post("/api/v1/sessions").send({
      email: "stella@email.com",
      password: "654321",
    });

    const token = authenticatedUserResponse.body.token;

    await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "Deposit",
    }).set("Authorization", `Bearer ${token}`);

    const createStatementResponse = await request(app).post(`/api/v1/statements/transfer/${id}`).send({
      amount: 100,
      description: "transfer",
    }).set("Authorization", `Bearer ${token}`);

    expect(createStatementResponse.status).toBe(400);
    expect(createStatementResponse.body).toStrictEqual({ message: 'User cannot transfer to yourself' });
  });
})
