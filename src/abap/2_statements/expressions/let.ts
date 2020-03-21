import {seq, str, plus, Expression} from "../combi";
import {InlineFieldDefinition} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Let extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("LET"), plus(new InlineFieldDefinition()), str("IN"));
  }
}