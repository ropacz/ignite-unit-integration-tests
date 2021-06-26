import { Statement } from "../../entities/Statement";

export type ITransferOperationDTO =
Pick<
  Statement,
  'user_id' |
  'receiver_id' |
  'description' |
  'amount'
>
