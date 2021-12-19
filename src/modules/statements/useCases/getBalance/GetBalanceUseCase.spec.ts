import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

import { GetBalanceError } from "./GetBalanceError";


let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;

describe("Get user balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("Should be able to show user balances", async () => {
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@email.com",
      password: "123"
    };

    const created_user = await createUserUseCase.execute(user);
    const result = await getBalanceUseCase.execute({user_id: created_user.id!});

    expect(result).toHaveProperty('statement');
    expect(result).toHaveProperty('balance');
  });

  it("Should not be able to show a balance of a inexistent user", async () => {
    expect(async () => {
      const result = await getBalanceUseCase.execute({user_id: 'inexistent_user_id'});
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
})
