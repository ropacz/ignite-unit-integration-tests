import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  test("should be able to obtain a user statement balance", async () => {
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

    await createStatementUseCase.execute(statementDeposit);

    const amountWithdraw = 500;

    const statementWithdraw = {
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: amountWithdraw,
      description: "description test",
    };

    await createStatementUseCase.execute(statementWithdraw);

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance.balance).toEqual(amountDeposit - amountWithdraw);
    expect(balance.statement).toHaveLength(2);
  });

  test("should not be able to obtain statement balance when user not-exists", async () => {
    const user_id = "any-uuid";

    const balance = getBalanceUseCase.execute({
      user_id,
    });

    await expect(balance).rejects.toBeInstanceOf(GetBalanceError);
    await expect(balance).rejects.toMatchObject({
      message: "User not found",
      statusCode: 404,
    });
  });
});
