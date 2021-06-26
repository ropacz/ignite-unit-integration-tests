import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { TransferOperationUseCase} from "./TransferOperationUseCase"

export class TransferOperationController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { receiver_id } = request.params
    const { amount, description } = request.body;

    const transferOperationUseCase = container.resolve(TransferOperationUseCase);

    const transfer = await transferOperationUseCase.execute({
      user_id,
      receiver_id,
      amount,
      description
    });

    return response.status(201).json(transfer);
  }
}
