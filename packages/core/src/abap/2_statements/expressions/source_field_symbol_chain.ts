import {Expression, seq, starPrio} from "../combi";
import {ArrowOrDash, ComponentName, FieldSymbol} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SourceFieldSymbolChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const chain = seq(new ArrowOrDash(), ComponentName);
    return seq(FieldSymbol, starPrio(chain));
  }
}