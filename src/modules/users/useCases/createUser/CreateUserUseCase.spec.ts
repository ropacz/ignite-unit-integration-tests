import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  test("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@gmail.com",
      password: "12324",
    });

    expect(user).toHaveProperty("id");
  });

  test("should not be able to create a new user with email already exists", async () => {
    await createUserUseCase.execute({
      name: "User",
      email: "user2@gmail.com",
      password: "12324",
    });

    const user = createUserUseCase.execute({
      name: "User novo 2",
      email: "user2@gmail.com",
      password: "12324",
    });

    await expect(user).rejects.toBeInstanceOf(CreateUserError);
    await expect(user).rejects.toMatchObject({
      message: "User already exists",
      statusCode: 400,
    });
  });
});
