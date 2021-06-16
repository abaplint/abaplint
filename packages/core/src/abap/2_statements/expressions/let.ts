import {seq, Expression, plusPrio} from "../combi";
import {InlineFieldDefinition} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Let extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("LET", plusPrio(InlineFieldDefinition), "IN");
  }
}