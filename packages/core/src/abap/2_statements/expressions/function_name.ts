import {alt, Expression} from "../combi";
import {Constant, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionName extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(Constant, FieldChain);
  }
}