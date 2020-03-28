import {Expression} from "../combi";
import {FieldSymbol} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SourceFieldSymbol extends Expression {
  public getRunnable(): IStatementRunnable {
    return new FieldSymbol();
  }
}