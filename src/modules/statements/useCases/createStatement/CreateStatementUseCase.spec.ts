import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { OperationType, Statement } from "../../entities/Statement";

import { CreateStatementError } from "./CreateStatementError";


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("Should be able to deposit", async () => {
    const user: ICreateUserDTO = {
      name: "Lucas Matheus",
      email: "lucas@email.com",
      password: "123456"
    };

    const created_user = await createUserUseCase.execute(user);

    const deposit_statement = await createStatementUseCase.execute({
      user_id: created_user.id!,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'deposit'

    });

    expect(deposit_statement).toBeInstanceOf(Statement);
    expect(deposit_statement.type).toBe(OperationType.DEPOSIT);
    expect(deposit_statement.amount).toBe(100);
  });

  it("Should be able to withdraw", async () => {
    const user: ICreateUserDTO = {
      name: "Lucas Matheus",
      email: "lucas@email.com",
      password: "123456"
    };

    const created_user = await createUserUseCase.execute(user);

    const deposit_statement = await createStatementUseCase.execute({
      user_id: created_user.id!,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'deposit'

    });

    const withdraw_statement = await createStatementUseCase.execute({
      user_id: created_user.id!,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: 'withdraw'

    });

    expect(withdraw_statement).toBeInstanceOf(Statement);
    expect(withdraw_statement.type).toBe(OperationType.WITHDRAW);
    expect(withdraw_statement.amount).toBe(100);

  });

  it("Should not be able to create a statement of a inexistent user", async () => {
    expect(async () => {

      await createStatementUseCase.execute({
        user_id: 'inexistent_user_id',
        type: OperationType.WITHDRAW,
        amount: 100,
        description: 'withdraw'

      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to withdraw with insufficient funds", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "Lucas Matheus",
        email: "lucas@email.com",
        password: "123456"
      };

      const created_user = await createUserUseCase.execute(user);

      await createStatementUseCase.execute({
        user_id: created_user.id!,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: 'withdraw'

      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });



})
