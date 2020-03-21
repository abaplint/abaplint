import {seq, str, plus, Expression, IStatementRunnable} from "../combi";
import {FormParam} from ".";

export class FormUsing extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("USING"), plus(new FormParam()));
  }
}