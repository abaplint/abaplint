import {seq, plus, Expression} from "../combi";
import {FormParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormChanging extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("CHANGING", plus(FormParam));
  }
}