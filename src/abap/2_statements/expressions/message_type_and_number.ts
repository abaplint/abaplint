import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class MessageTypeAndNumber extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^[iweaxs]\d\d\d$/i);
  }
}