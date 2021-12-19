import request from "supertest";

import { app } from "../../../../app";

import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Authenticate User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Lucas Matheus",
      email: "lucas@email.com",
      password: "123456",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "lucas@email.com",
      password: "123456",
    });

    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.email).toEqual("lucas@email.com")
  });

  it("Should not be able to authenticate an user that does not exists", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "inexistent_email",
      password: "inexistent_password",
    });

    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({ message: 'Incorrect email or password' });
  });

})
