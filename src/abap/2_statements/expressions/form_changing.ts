import {seq, str, plus, Expression, IStatementRunnable} from "../combi";
import {FormParam} from ".";

export class FormChanging extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("CHANGING"), plus(new FormParam()));
  }
}