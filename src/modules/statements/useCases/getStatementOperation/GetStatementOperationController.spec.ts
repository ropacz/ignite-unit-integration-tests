import { hash } from "bcryptjs";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { StatementsRepository } from "../../repositories/StatementsRepository";
import { UsersRepository } from "../../../users/repositories/UsersRepository";

let connection: Connection;
let statementsRepository: StatementsRepository;
let usersRepository: UsersRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation", () => {
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

  test("should be able to obtain the user statement operation", async () => {
    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "user123",
    });

    const { user, token } = session.body;

    const statementDeposit = {
      amount: "100.00",
      description: "description deposit",
      type: OperationType.DEPOSIT,
    };

    const statementWithdraw = {
      amount: "50.00",
      description: "description withdraw",
      type: OperationType.WITHDRAW,
    };

    const deposit = await createStatementUseCase.execute({
      amount: parseFloat(statementDeposit.amount),
      description: statementDeposit.description,
      user_id: user.id,
      type: statementDeposit.type,
    });

    const responseDeposit = await request(app)
      .get(`/api/v1/statements/${deposit.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseDeposit.body).toHaveProperty("id");
    expect(responseDeposit.body).toMatchObject(statementDeposit);

    const withdraw = await createStatementUseCase.execute({
      amount: parseFloat(statementWithdraw.amount),
      description: statementWithdraw.description,
      user_id: user.id,
      type: statementWithdraw.type,
    });

    const responseWithdraw = await request(app)
      .get(`/api/v1/statements/${withdraw.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.body).toHaveProperty("id");
    expect(responseWithdraw.body).toMatchObject(statementWithdraw);
  });
});
