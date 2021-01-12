import {alt, Expression} from "../combi";
import {Constant, TextElement, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

// BasicSource vs SimpleSource vs ConstantOrFieldSource is a mess...

export class ConstantOrFieldSource extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(Constant, TextElement, FieldChain);
  }
}