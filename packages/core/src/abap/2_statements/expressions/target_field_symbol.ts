import {Expression, optPrio, seq} from "../combi";
import {FieldSymbol, TableBody} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TargetFieldSymbol extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(FieldSymbol, optPrio(TableBody));
  }
}