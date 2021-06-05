import { hash } from "bcryptjs";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;
describe("Show User Profile", () => {
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

  test("should be able to show the user profile", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "user123",
    });

    const { token } = session.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  test("should not be able to show the user profile when the user not exists", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "passwordInvalid",
    });

    const { token } = session.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ message: "JWT invalid token!" });
  });
});
