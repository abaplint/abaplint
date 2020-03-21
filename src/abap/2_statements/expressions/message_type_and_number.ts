import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class MessageTypeAndNumber extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^[iweaxs]\d\d\d$/i);
  }
}