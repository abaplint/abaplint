import {alt, Expression} from "../combi";
import {TargetFieldSymbol, InlineFS} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FSTarget extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(new InlineFS(), new TargetFieldSymbol());
  }
}