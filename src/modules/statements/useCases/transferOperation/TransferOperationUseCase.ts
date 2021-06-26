import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { TransferOperationError } from "./TransferOperationError";
import { ITransferOperationDTO } from "./ITransferOperationDTO";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

@injectable()
class TransferOperationUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    receiver_id,
    amount,
    description,
  }: ITransferOperationDTO) {
    const sender = await this.usersRepository.findById(user_id);

    if (!receiver_id) {
      throw new TransferOperationError.ReceiverNotFound();
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!sender) {
      throw new TransferOperationError.SenderNotFound();
    }

    if (!receiver) {
      throw new TransferOperationError.ReceiverNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id,
    });

    if (balance < amount) {
      throw new TransferOperationError.InsufficientFunds();
    }

    const transferOperation = await this.statementsRepository.create({
      user_id,
      receiver_id,
      type: OperationType.TRANSFER,
      amount,
      description,
    });

    return transferOperation;
  }
}

export {TransferOperationUseCase}
