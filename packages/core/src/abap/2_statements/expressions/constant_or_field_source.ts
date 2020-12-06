import {alts, Expression} from "../combi";
import {Constant, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ConstantOrFieldSource extends Expression {
  public getRunnable(): IStatementRunnable {
    return alts(Constant, FieldChain);
  }
}