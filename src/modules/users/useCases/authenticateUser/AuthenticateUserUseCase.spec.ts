import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  test("should be able an user authenticate with success", async () => {
    const user = {
      name: "User Novo",
      email: "user123@gmail.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    const userAuth = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(userAuth.user).toHaveProperty("id");
    expect(userAuth).toHaveProperty("token");
  });

  test("should not be able an user authenticate with success when the password is incorrect", async () => {
    const user = {
      name: "User Novo",
      email: "user123@gmail.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    const userAuth = authenticateUserUseCase.execute({
      email: user.email,
      password: "4321",
    });

    await expect(userAuth).rejects.toBeInstanceOf(
      IncorrectEmailOrPasswordError
    );
    await expect(userAuth).rejects.toMatchObject({
      message: "Incorrect email or password",
      statusCode: 401,
    });
  });

  test("should not be able an user authenticate with success when the email is incorrect", async () => {
    const user = {
      name: "User Novo",
      email: "user123@gmail.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    const userAuth = authenticateUserUseCase.execute({
      email: "usernew123@gmail.com",
      password: user.password,
    });

    await expect(userAuth).rejects.toBeInstanceOf(
      IncorrectEmailOrPasswordError
    );
    await expect(userAuth).rejects.toMatchObject({
      message: "Incorrect email or password",
      statusCode: 401,
    });
  });
});
