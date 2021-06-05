import { hash } from "bcryptjs";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { UsersRepository } from "../../repositories/UsersRepository";

let connection: Connection;
let usersRepository: UsersRepository;
let createUserUseCase: CreateUserUseCase;
describe("Create User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    usersRepository = new UsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);

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

  test("should be able to create a new user", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "user123",
    });

    const { token } = session.body;

    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "New user create",
        email: "newuser@gmail.com",
        password: "password",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  test("should not be able to create a new user with email already exists", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "user123",
    });

    const { token } = session.body;

    await createUserUseCase.execute({
      name: "user",
      email: "userexists@gmail.com",
      password: "password",
    });

    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "user",
        email: "userexists@gmail.com",
        password: "1234",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ message: "User already exists" });
  });
});
