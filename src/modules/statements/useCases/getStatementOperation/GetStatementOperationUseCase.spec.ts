import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

import { GetStatementOperationError } from "./GetStatementOperationError";

import { OperationType, Statement } from "../../entities/Statement";


let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('GetStatementOperationUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

  })

  it('should be able to get statement operation', async () => {
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

    const gotStatement = await getStatementOperationUseCase.execute({
      user_id: created_user.id!,
      statement_id: deposit_statement.id!
    })

    expect(gotStatement).toEqual(deposit_statement);
    expect(gotStatement.amount).toEqual(100);
    expect(gotStatement).toBeInstanceOf(Statement);
  })

  it("Should not be able to get a statement of an inexistent user", async () => {
    expect(async () => {

      await getStatementOperationUseCase.execute({
        user_id: 'inexistent_user_id',
        statement_id: ''
      })

    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get an inexistent statement operation", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "Lucas Matheus",
        email: "lucas@email.com",
        password: "123456"
      };

      const created_user = await createUserUseCase.execute(user);
      await getStatementOperationUseCase.execute({
        user_id: created_user.id!,
        statement_id: 'inexistent_statement'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
})
