

import { AppError } from '../../../../shared/errors/AppError';
import { User } from '../../entities/User';
// import { CreateUserError } from './CreateUserError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from './CreateUserUseCase';
import { ICreateUserDTO } from './ICreateUserDTO';

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("Should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "Lucas Matheus",
      email: "lucas@email.com",
      password: "123456"
    }

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    })

    const userFound = await inMemoryUsersRepository.findByEmail(user.email)

    expect(userFound).toHaveProperty("id")
    expect(userFound).toBeInstanceOf(User)
  });

  it("Should not be able to create a user that already exists", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "Lucas Matheus",
        email: "lucas@email.com",
        password: "123456"
      }

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      })

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      })
    }).rejects.toBeInstanceOf(AppError)

  })
});
