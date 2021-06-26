import { Statement } from "../entities/Statement";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementDTO } from "./StatementsRepository";

export interface IStatementsRepository {
  create: (data: IStatementDTO) => Promise<Statement>;
  findStatementOperation: (
    data: IGetStatementOperationDTO
  ) => Promise<Statement | undefined>;
  getUserBalance: (
    data: IGetBalanceDTO
  ) => Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  >;
}
