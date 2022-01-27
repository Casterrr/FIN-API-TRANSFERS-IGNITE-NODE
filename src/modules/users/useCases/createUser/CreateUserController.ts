import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateUserUseCase } from './CreateUserUseCase';

export class CreateUserController {
  async execute(request: Request, response: Response) {
    const { id, name, email, password } = request.body;

    const createUser = container.resolve(CreateUserUseCase);

    if (id) {
      await createUser.execute({
        id,
        name,
        email,
        password
      });

      return response.status(201).send();
    }

    await createUser.execute({
      name,
      email,
      password
    });

    return response.status(201).send();
  }
}
