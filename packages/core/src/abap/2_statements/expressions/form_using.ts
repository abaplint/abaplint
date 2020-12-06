import {seq, pluss, Expression} from "../combi";
import {FormParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormUsing extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("USING", pluss(FormParam));
  }
}