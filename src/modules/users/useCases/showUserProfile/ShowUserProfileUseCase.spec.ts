import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
// import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("Should be able to show user profile", async () => {
    const user = {
      name: "test",
      email: "test@email.com",
      password: "123"
    };

    const created_user = await createUserUseCase.execute(user);

    const user_id = created_user.id!;

    const userFound = await showUserProfileUseCase.execute(user_id);

    expect(userFound).toHaveProperty("id")
  });

  it("Should not be able to show a inexistent user profile", async () => {
    expect(async () => {
      const user_id = 'inexistent_user_id';

      await showUserProfileUseCase.execute(user_id);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
})
