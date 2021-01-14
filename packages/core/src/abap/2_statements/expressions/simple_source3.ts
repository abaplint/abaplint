import {alt, Expression} from "../combi";
import {Constant, TextElement, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SimpleSource3 extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(Constant, TextElement, FieldChain);
  }
}