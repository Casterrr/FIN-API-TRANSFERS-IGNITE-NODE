import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    amount,
    description,
    type,
    sender_id
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type,
      sender_id
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {

    // Pega todos os statements relacionados ao user_id passado no parâmetro dessa função transfer
    // A Lógica é: Me retorne todos os statements cuja coluna user_id OU sender_id contenham o user_id passado
    const statement = await this.repository.find({
      where: [
        { user_id },
        { sender_id: user_id }
      ]
    });


    const balance = statement.reduce((acc, operation) => {
      // Caso seja do tipo transfer e o user_id do statement seja igual ao user_id passado na função, significa que o esse user_id passado na função quem recebeu uma transferência, logo, soma.
      if (operation.type === 'deposit' || (operation.type === 'transfer' && operation.user_id === user_id)) {
        return acc + operation.amount;
      } else {
        return acc - operation.amount;
      }
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }
}
