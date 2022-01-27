import { inject, injectable } from "tsyringe";
import { hash } from 'bcryptjs';

import { CreateUserError } from "./CreateUserError";

import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ICreateUserDTO } from "./ICreateUserDTO";

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  async execute({ id, name, email, password }: ICreateUserDTO) {
    const userAlreadyExists = await this.usersRepository.findByEmail(email);

    if (userAlreadyExists) {
      throw new CreateUserError();
    }

    const passwordHash = await hash(password, 8);

    if (id) {
      const user = await this.usersRepository.create({
        id,
        email,
        name,
        password: passwordHash,
      });

      return user;
    }

    const user = await this.usersRepository.create({
      email,
      name,
      password: passwordHash,
    });

    return user;
  }
}
