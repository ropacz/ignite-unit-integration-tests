import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  test("should be able to obtain the user statement operation", async () => {
    const user = await createUserUseCase.execute({
      name: "user",
      email: "user@gmail.com",
      password: "1234",
    });

    const amountDeposit = 2000;

    const statementDeposit = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: amountDeposit,
      description: "description test",
    };

    const statement = await createStatementUseCase.execute(statementDeposit);

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    const expectedStatement = {
      user_id: user.id,
      type: statementDeposit.type,
      amount: statementDeposit.amount,
      description: statementDeposit.description,
    };

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toMatchObject(expectedStatement);
  });

  test("should not be able to obtain the user statement operation when not exist a user", async () => {
    const user = await createUserUseCase.execute({
      name: "user",
      email: "user@gmail.com",
      password: "1234",
    });

    const amountDeposit = 2000;

    const statementDeposit = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: amountDeposit,
      description: "description test",
    };

    const statement = await createStatementUseCase.execute(statementDeposit);

    const user_id = "any-uuid";

    const statementOperation = getStatementOperationUseCase.execute({
      user_id,
      statement_id: statement.id as string,
    });

    await expect(statementOperation).rejects.toEqual(
      new GetStatementOperationError.UserNotFound()
    );
    await expect(statementOperation).rejects.toMatchObject({
      message: "User not found",
      statusCode: 404,
    });
  });

  test("should not be able to obtain the user statement operation when not exist a statement", async () => {
    const user = await createUserUseCase.execute({
      name: "user",
      email: "user@gmail.com",
      password: "1234",
    });

    const statement_id = "any-uuid";

    const statementOperation = getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id,
    });

    await expect(statementOperation).rejects.toEqual(
      new GetStatementOperationError.StatementNotFound()
    );
    await expect(statementOperation).rejects.toMatchObject({
      message: "Statement not found",
      statusCode: 404,
    });
  });
});
