import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
// import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
// import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
// let createUserUseCase: CreateUserUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    // createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("Should be able to show user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "Lucas Matheus",
      email: "lucas@email.com",
      password: "123456"
    });

    const user_id = user.id

    const userFound = await showUserProfileUseCase.execute(user_id as string);

    expect(userFound).toHaveProperty("id")
  });
})
