import { hash } from "bcryptjs";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import { StatementsRepository } from "../../repositories/StatementsRepository";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let connection: Connection;
let statementsRepository: StatementsRepository;
let usersRepository: UsersRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    statementsRepository = new StatementsRepository();
    usersRepository = new UsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

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

  test("should be able deposit amount in statement balance", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "user123",
    });

    const { user, token } = session.body;

    const statementDeposit = {
      user_id: user.id,
      amount: 100.0,
      description: "description test",
      type: OperationType.DEPOSIT,
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: statementDeposit.amount,
        description: statementDeposit.description,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(statementDeposit);
  });

  test("should be able withdraw amount in statement balance", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "user123",
    });

    const { user, token } = session.body;

    const statementDeposit = {
      amount: 100.0,
      description: "description deposit",
      type: OperationType.DEPOSIT,
    };

    await createStatementUseCase.execute({
      amount: statementDeposit.amount,
      description: statementDeposit.description,
      user_id: user.id,
      type: statementDeposit.type,
    });

    const statementWithdraw = {
      amount: 50.0,
      description: "description withdraw",
      type: OperationType.WITHDRAW,
    };

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: statementWithdraw.amount,
        description: statementWithdraw.description,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(statementWithdraw);
  });
});
