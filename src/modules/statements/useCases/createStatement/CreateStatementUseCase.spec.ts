import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  test("should be able deposit amount in statement balance", async () => {
    const user = await createUserUseCase.execute({
      name: "user",
      email: "user@gmail.com",
      password: "1234",
    });

    const statementDeposit = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 2000,
      description: "description test",
    };

    const statement = await createStatementUseCase.execute(statementDeposit);

    expect(statement).toHaveProperty("id");
    expect(statement).toMatchObject(statementDeposit);
  });

  test("should be able withdraw amount in statement balance", async () => {
    const user = await createUserUseCase.execute({
      name: "user",
      email: "user@gmail.com",
      password: "1234",
    });

    const amountDeposit = 1000;

    const statementDeposit = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: amountDeposit,
      description: "description test",
    };

    await createStatementUseCase.execute(statementDeposit);

    const statementWithdraw = {
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: amountDeposit,
      description: "description test",
    };

    const statement = await createStatementUseCase.execute(statementWithdraw);

    expect(statement).toHaveProperty("id");
    expect(statement).toMatchObject(statementWithdraw);
  });

  test("should not be able to create a statement balance when user not-exists", async () => {
    const statementDeposit = {
      user_id: "any-uuid",
      type: OperationType.DEPOSIT,
      amount: 2000,
      description: "description test",
    };

    const statement = createStatementUseCase.execute(statementDeposit);

    await expect(statement).rejects.toEqual(
      new CreateStatementError.UserNotFound()
    );

    await expect(statement).rejects.toMatchObject({
      message: "User not found",
      statusCode: 404,
    });
  });

  test("should not be able to create a statement balance when funds are insufficient", async () => {
    const user = await createUserUseCase.execute({
      name: "user",
      email: "user@gmail.com",
      password: "1234",
    });

    const amountDeposit = 1000;

    const statementDeposit = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: amountDeposit,
      description: "description test",
    };

    await createStatementUseCase.execute(statementDeposit);

    const statementWithdraw = {
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: amountDeposit + 1,
      description: "description test",
    };

    const statement = createStatementUseCase.execute(statementWithdraw);

    await expect(statement).rejects.toEqual(
      new CreateStatementError.InsufficientFunds()
    );

    await expect(statement).rejects.toMatchObject({
      message: "Insufficient funds",
      statusCode: 400,
    });
  });
});
