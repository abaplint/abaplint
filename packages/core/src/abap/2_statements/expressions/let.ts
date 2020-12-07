import {seq, plus, Expression} from "../combi";
import {InlineFieldDefinition} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Let extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("LET", plus(InlineFieldDefinition), "IN");
  }
}