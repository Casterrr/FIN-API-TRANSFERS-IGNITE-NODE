import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { StatementsRepository } from "../../repositories/StatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let statementsRepository: StatementsRepository;
// let createUserUseCase: CreateUserUseCase;

describe("Get user balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    statementsRepository = new StatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, inMemoryUsersRepository);
    // createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("Should be able to show user balances", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "Lucas Matheus",
      email: "lucas@email.com",
      password: "123456"
    });

    const user_id = user.id as string

    console.log(user_id)

    const userBalance = await getBalanceUseCase.execute({ user_id });

    expect(userBalance).toHaveProperty("statement");
    expect(userBalance).toHaveProperty("balance");

    //ATENÇÃO, SE VOCÊ ESTÁ LENDO ESSE COMENTÁRIO É POR QUE NESSA VERSÃO DO PROJETO ESSE TESTE ESTÁ COM UM ERRO DE CONEXÃO COM DATABASE E FOI PRECISO MIGRAR DO WINDOWS PRO LINUX PRA USAR O POSTGRES
  });
})
