import {seqs, pluss, Expression} from "../combi";
import {InlineFieldDefinition} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Let extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs("LET", pluss(InlineFieldDefinition), "IN");
  }
}