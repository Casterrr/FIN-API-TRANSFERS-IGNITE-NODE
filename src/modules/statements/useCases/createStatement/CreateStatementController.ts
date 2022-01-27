import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { receiver_user_id } = request.params

    const splittedPath = request.originalUrl.split('/')
    let type = splittedPath[splittedPath.length - 1] as OperationType;

    if (type !== OperationType.DEPOSIT && type !== OperationType.WITHDRAW && type !== OperationType.TRANSFER) {
      type = splittedPath[splittedPath.length - 2] as OperationType;
    }


    //agora tu não vai criar um statement pra quem enviou e outro pra quem recebeu (não!) agora tu vai criar
    //só um statement pra quem recebeu. Por que? Por que isso, apesar de parecer que sim, não vai atrapalhar
    //na hora do balance, já que lá no próprio getUserBalance será feita essa lógica de quando "-" uma transfer
    //ou "+" uma transfer
    if (type === OperationType.TRANSFER) {
      const createStatement = container.resolve(CreateStatementUseCase);

      const statement = await createStatement.execute({
        user_id: receiver_user_id,
        type,
        amount,
        description,
        sender_id: user_id
      });

      return response.status(201).json(statement);
    }

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      type,
      amount,
      description,
    });

    return response.status(201).json(statement);
  }
}
