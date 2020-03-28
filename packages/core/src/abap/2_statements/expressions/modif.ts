import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Modif extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^\w{1,3}$/);
  }
}