import {Expression} from "../combi";
import {ClassName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SuperClassName extends Expression {
  public getRunnable(): IStatementRunnable {
    return new ClassName();
  }
}