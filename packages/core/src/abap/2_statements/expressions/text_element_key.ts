import {Expression, regex as reg} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class TextElementKey extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^\w{3}$/);
  }
}