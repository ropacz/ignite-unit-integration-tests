import { hash } from "bcryptjs";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;
describe("Authenticate User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("user123", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${uuidV4()}', 'user', 'user@gmail.com', '${password}', 'now()', 'now()')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  test("should be able an user authenticate with success", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "user123",
    });

    expect(session.body.user).toHaveProperty("id");
    expect(session.body).toHaveProperty("token");
  });

  test("should not be able an user authenticate with success when the password is incorrect", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "passwordInvalid",
    });

    expect(session.status).toBe(401);
    expect(session.body).toMatchObject({
      message: "Incorrect email or password",
    });
  });

  test("should not be able an user authenticate with success when the email is incorrect", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "emailincorrect@gmail.com",
      password: "user123",
    });

    expect(session.status).toBe(401);
    expect(session.body).toMatchObject({
      message: "Incorrect email or password",
    });
  });
});
