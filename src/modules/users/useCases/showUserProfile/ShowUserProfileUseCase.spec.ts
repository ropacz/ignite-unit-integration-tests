import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  test("should be able to show the user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@gmail.com",
      password: "12324",
    });

    const showUser = await showUserProfileUseCase.execute(user.id as string);

    expect(showUser.id).toEqual(user.id);
    expect(showUser.email).toEqual(user.email);
  });

  test("should not be able to show the user profile when not exist register user", async () => {
    const user_id = "11111";

    const showUser = showUserProfileUseCase.execute(user_id);

    await expect(showUser).rejects.toBeInstanceOf(ShowUserProfileError);
    await expect(showUser).rejects.toMatchObject({
      message: "User not found",
      statusCode: 404,
    });
  });
});
